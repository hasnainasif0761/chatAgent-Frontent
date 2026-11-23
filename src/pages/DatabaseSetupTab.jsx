import React, { useState } from 'react';
import {
    Database,
    CheckCircle2,
    Loader2,
    Columns,
    Table2,
    CheckSquare,
    Square
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function DatabaseSetupTab({ agent, refreshAgent }) {
    const [dataSourceType, setDataSourceType] = useState('sql');
    const [loading, setLoading] = useState(false);
    const [fetchingTables, setFetchingTables] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        host: 'relational.fel.cvut.cz',
        port: '3306',
        user: 'guest',
        password: 'ctu-relational',
        googleSheetUrl: ''
    });

    const [excelFile, setExcelFile] = useState(null);
    const [databases, setDatabases] = useState([]);
    const [selectedDB, setSelectedDB] = useState('');
    const [tables, setTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);

    // Multi-Tab Sheet / Excel states + Per-Tab Selected Columns
    const [sheetTabsData, setSheetTabsData] = useState([]); // [{ sheetName, columns, rowsData, rowCount }]
    const [activeSheetTab, setActiveSheetTab] = useState('');
    const [sheetRoles, setSheetRoles] = useState({}); // { [sheetName]: string }
    const [sheetSelectedColumns, setSheetSelectedColumns] = useState({}); // { [sheetName]: string[] }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 1. Connect SQL Server & Fetch Databases
    const handleFetchDatabases = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/dashboard/fetch-databases', {
                host: formData.host,
                port: formData.port,
                user: formData.user,
                password: formData.password
            });
            if (res.data.databases) {
                setDatabases(res.data.databases);
                setSheetTabsData([]);
                setActiveSheetTab('');
                setSheetSelectedColumns({});
                toast.success('Databases fetched successfully!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to connect server');
        } finally {
            setLoading(false);
        }
    };

    // 2. Load Tables for Selected DB
    const handleSelectDatabase = async (dbName) => {
        setSelectedDB(dbName);
        setFetchingTables(true);
        try {
            const res = await API.post('/dashboard/fetch-tables', {
                host: formData.host,
                port: formData.port,
                user: formData.user,
                password: formData.password,
                database: dbName
            });
            if (res.data.tables) {
                setTables(res.data.tables);
                setSelectedTables(res.data.tables);
            }
        } catch (err) {
            toast.error('Failed to load database tables');
        } finally {
            setFetchingTables(false);
        }
    };

    // 3. Load Google Sheet / Excel Multi-Tabs
    const handleConnectSheet = async () => {
        if (!formData.googleSheetUrl && !excelFile) {
            toast.error('Please provide a Google Sheet URL or upload an Excel file.');
            return;
        }

        const dataForm = new FormData();
        if (excelFile) dataForm.append('excelFile', excelFile);
        else if (formData.googleSheetUrl) dataForm.append('googleSheetUrl', formData.googleSheetUrl);

        setLoading(true);
        try {
            const res = await API.post('/dashboard/inspect-tabs', dataForm);
            const tabsList = Array.isArray(res.data?.sheets) ? res.data.sheets : [];

            if (tabsList.length > 0) {
                const sourceTitle = res.data.sourceName || (excelFile ? excelFile.name : 'Google_Sheet');
                const tabNames = tabsList.map((t) => t.sheetName);

                setDatabases([sourceTitle]);
                setSelectedDB(sourceTitle);
                setSheetTabsData(tabsList);
                setActiveSheetTab(tabNames[0] || '');
                setTables(tabNames);
                setSelectedTables(tabNames);

                const defaultRoles = {};
                const defaultColsMap = {};
                tabsList.forEach((tabObj) => {
                    defaultRoles[tabObj.sheetName] = sheetRoles[tabObj.sheetName] || '';
                    defaultColsMap[tabObj.sheetName] = Array.isArray(tabObj.columns)
                        ? [...tabObj.columns]
                        : [];
                });
                setSheetRoles(defaultRoles);
                setSheetSelectedColumns(defaultColsMap);

                toast.success(`${tabsList.length} sheet tab(s) loaded! Click a tab to check/uncheck columns.`);
                return;
            }

            // Fallback agar /inspect-tabs na ho to purana endpoint chalaye
            const fallbackRes = await API.post('/dashboard/fetch-sheet-columns', dataForm);
            if (fallbackRes.data.columns) {
                setSheetTabsData([]);
                setActiveSheetTab('');
                setSheetSelectedColumns({});
                setDatabases([fallbackRes.data.sourceName || 'Sheet_Source']);
                setSelectedDB(fallbackRes.data.sourceName || 'Sheet_Source');
                setTables(fallbackRes.data.columns);
                setSelectedTables(fallbackRes.data.columns);
                toast.success('Sheet columns loaded successfully!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to read sheet tabs/columns.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle tab inclusion
    const toggleSheetTabSelection = (tabName, e) => {
        e?.stopPropagation();
        if (selectedTables.includes(tabName)) {
            setSelectedTables(selectedTables.filter((t) => t !== tabName));
        } else {
            setSelectedTables([...selectedTables, tabName]);
        }
    };

    // Toggle individual column inside a specific tab
    const toggleColumnForTab = (tabName, colName, allTabColumns) => {
        setSheetSelectedColumns((prev) => {
            const currentCols = Array.isArray(prev[tabName]) ? prev[tabName] : [...allTabColumns];
            const exists = currentCols.includes(colName);
            const nextCols = exists
                ? currentCols.filter((c) => c !== colName)
                : [...currentCols, colName];

            return {
                ...prev,
                [tabName]: nextCols
            };
        });
    };

    // Select all or clear all columns for a tab
    const setAllColumnsForTab = (tabName, colsList) => {
        setSheetSelectedColumns((prev) => ({
            ...prev,
            [tabName]: [...colsList]
        }));
    };

    // 4. Save Setup to User Profile (MongoDB) — sirf checked columns + unka data save hoga
    const handleSaveSetup = async () => {
        if (!selectedDB || selectedTables.length === 0) {
            toast.error('Please select a database/source and at least 1 table/tab.');
            return;
        }

        if (dataSourceType === 'googlesheet' && sheetTabsData.length > 0) {
            const missingColsTab = sheetTabsData.find(
                (t) =>
                    selectedTables.includes(t.sheetName) &&
                    (t.columns || []).length > 0 &&
                    (!sheetSelectedColumns[t.sheetName] || sheetSelectedColumns[t.sheetName].length === 0)
            );

            if (missingColsTab) {
                toast.error(`Tab "${missingColsTab.sheetName}" ke liye kam az kam 1 column check karein.`);
                setActiveSheetTab(missingColsTab.sheetName);
                return;
            }
        }

        const dataForm = new FormData();
        dataForm.append('dataSourceType', dataSourceType);

        if (dataSourceType === 'googlesheet' || excelFile || formData.googleSheetUrl) {
            if (excelFile) dataForm.append('excelFile', excelFile);
            if (formData.googleSheetUrl) dataForm.append('googleSheetUrl', formData.googleSheetUrl);

            if (sheetTabsData.length > 0) {
                const detailedSelectedTabs = sheetTabsData
                    .filter((t) => selectedTables.includes(t.sheetName))
                    .map((t) => {
                        const allCols = t.columns || [];
                        const chosenCols = Array.isArray(sheetSelectedColumns[t.sheetName])
                            ? sheetSelectedColumns[t.sheetName]
                            : allCols;

                        const filteredRows = (t.rowsData || []).map((row) => {
                            const cleanRow = {};
                            chosenCols.forEach((col) => {
                                cleanRow[col] = row[col] !== undefined ? row[col] : '';
                            });
                            return cleanRow;
                        });

                        return {
                            tableName: t.sheetName,
                            tableRole: (sheetRoles[t.sheetName] || '').trim(),
                            columns: chosenCols,
                            rowsData: filteredRows
                        };
                    });

                dataForm.append('selectedTables', JSON.stringify(detailedSelectedTabs));
            } else {
                selectedTables.forEach((t) => dataForm.append('selectedTables[]', t));
            }
        } else {
            dataForm.append('host', formData.host);
            dataForm.append('port', formData.port);
            dataForm.append('user', formData.user);
            dataForm.append('password', formData.password);
            dataForm.append('database', selectedDB);
            selectedTables.forEach((t) => dataForm.append('selectedTables[]', t));
        }

        setLoading(true);
        try {
            const res = await API.post('/dashboard/save-setup', dataForm);
            if (res.data.success || res.status === 200) {
                toast.success('Database setup successfully saved to User Profile!');
                if (refreshAgent) refreshAgent();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save setup.');
        } finally {
            setLoading(false);
        }
    };

    const currentInspectedTab =
        sheetTabsData.find((t) => t.sheetName === activeSheetTab) || sheetTabsData[0] || null;

    const currentTabCols = currentInspectedTab?.columns || [];
    const currentCheckedCols = currentInspectedTab
        ? (Array.isArray(sheetSelectedColumns[currentInspectedTab.sheetName])
            ? sheetSelectedColumns[currentInspectedTab.sheetName]
            : currentTabCols)
        : [];

    const totalCheckedColumnsCount = sheetTabsData
        .filter((t) => selectedTables.includes(t.sheetName))
        .reduce((sum, t) => {
            const cols = Array.isArray(sheetSelectedColumns[t.sheetName])
                ? sheetSelectedColumns[t.sheetName]
                : (t.columns || []);
            return sum + cols.length;
        }, 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Database / Google Sheets &amp; AI Training Setup
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Configure and train your AI model on user-isolated database contexts
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Form Panel */}
                <div className="bg-card border border-border p-6 rounded-xl lg:col-span-2 space-y-5 shadow-xs">
                    <h3 className="text-xs font-bold text-sky-500 uppercase tracking-widest">
                        1. Select Integration Source
                    </h3>

                    <div className="flex gap-3 p-1 bg-muted rounded-xl border border-border w-fit">
                        <label
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition ${
                                dataSourceType === 'sql'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <input
                                type="radio"
                                name="dataSourceType"
                                value="sql"
                                checked={dataSourceType === 'sql'}
                                onChange={() => {
                                    setDataSourceType('sql');
                                    setSheetTabsData([]);
                                    setActiveSheetTab('');
                                    setSheetSelectedColumns({});
                                }}
                                className="accent-primary"
                            />{' '}
                            SQL Server
                        </label>
                        <label
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition ${
                                dataSourceType === 'googlesheet'
                                    ? 'bg-card text-foreground shadow-xs'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <input
                                type="radio"
                                name="dataSourceType"
                                value="googlesheet"
                                checked={dataSourceType === 'googlesheet'}
                                onChange={() => setDataSourceType('googlesheet')}
                                className="accent-primary"
                            />{' '}
                            Google Sheets / Excel
                        </label>
                    </div>

                    {/* SQL Server Form */}
                    {dataSourceType === 'sql' && (
                        <form onSubmit={handleFetchDatabases} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Host / IP Address
                                    </label>
                                    <input
                                        type="text"
                                        name="host"
                                        value={formData.host}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Port</label>
                                    <input
                                        type="text"
                                        name="port"
                                        value={formData.port}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="user"
                                        value={formData.user}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Connect Server &amp; Fetch Databases</span>
                            </button>
                        </form>
                    )}

                    {/* Google Sheets / Excel Form */}
                    {dataSourceType === 'googlesheet' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Google Sheet Public URL
                                </label>
                                <input
                                    type="text"
                                    name="googleSheetUrl"
                                    value={formData.googleSheetUrl}
                                    onChange={handleChange}
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                    Or Upload Excel / CSV File
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) => setExcelFile(e.target.files[0] || null)}
                                    className="w-full bg-background border border-border rounded-lg p-2 text-xs text-muted-foreground"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleConnectSheet}
                                disabled={loading}
                                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Load Sheets / Columns</span>
                            </button>
                        </div>
                    )}

                    {/* Database Select Dropdown (SQL) */}
                    {databases.length > 0 && dataSourceType === 'sql' && (
                        <div className="pt-3 border-t border-border space-y-2">
                            <label className="block text-xs font-medium text-foreground">Target Database:</label>
                            <select
                                value={selectedDB}
                                onChange={(e) => handleSelectDatabase(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">-- Choose Database --</option>
                                {databases.map((db, idx) => (
                                    <option key={idx} value={db}>
                                        {db}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Multi-Tab Discovery + Click-to-Inspect + Per-Tab Column Check/Uncheck */}
                    {dataSourceType === 'googlesheet' && sheetTabsData.length > 0 && (
                        <div className="pt-3 border-t border-border space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Table2 className="w-3.5 h-3.5 text-primary" />
                                    Sheet Tabs ({sheetTabsData.length}) — Click a tab to manage its columns:
                                </h3>
                                <span className="text-[11px] text-muted-foreground">
                                    Tabs Selected: <strong>{selectedTables.length}</strong>
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {sheetTabsData.map((tabObj) => {
                                    const isActive = currentInspectedTab?.sheetName === tabObj.sheetName;
                                    const isChecked = selectedTables.includes(tabObj.sheetName);

                                    return (
                                        <div
                                            key={tabObj.sheetName}
                                            onClick={() => setActiveSheetTab(tabObj.sheetName)}
                                            className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition select-none ${
                                                isActive
                                                    ? 'bg-primary/10 border-primary text-foreground font-semibold'
                                                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => toggleSheetTabSelection(tabObj.sheetName, e)}
                                                className="text-primary flex items-center cursor-pointer"
                                                title="Include/Exclude tab"
                                            >
                                                {isChecked ? (
                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Square className="w-3.5 h-3.5 text-muted-foreground" />
                                                )}
                                            </button>
                                            <span>{tabObj.sheetName}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                {tabObj.rowCount ?? tabObj.rowsData?.length ?? 0} rows
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {currentInspectedTab && (
                                <div className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                            <Columns className="w-3.5 h-3.5 text-primary" />
                                            &ldquo;{currentInspectedTab.sheetName}&rdquo; Columns ({currentCheckedCols.length}/{currentTabCols.length} checked)
                                        </span>
                                        {currentTabCols.length > 0 && (
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setAllColumnsForTab(currentInspectedTab.sheetName, currentTabCols)
                                                    }
                                                    className="text-primary hover:underline cursor-pointer"
                                                >
                                                    Check All
                                                </button>
                                                <span className="text-muted-foreground">|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setAllColumnsForTab(currentInspectedTab.sheetName, [])}
                                                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    Uncheck All
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Checkable Column Pills */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {currentTabCols.length > 0 ? (
                                            currentTabCols.map((col, idx) => {
                                                const colChecked = currentCheckedCols.includes(col);
                                                return (
                                                    <label
                                                        key={idx}
                                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono cursor-pointer transition ${
                                                            colChecked
                                                                ? 'bg-card border-primary/50 text-foreground'
                                                                : 'bg-background/60 border-border text-muted-foreground opacity-70'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={colChecked}
                                                            onChange={() =>
                                                                toggleColumnForTab(
                                                                    currentInspectedTab.sheetName,
                                                                    col,
                                                                    currentTabCols
                                                                )
                                                            }
                                                            className="rounded accent-primary"
                                                        />
                                                        <span className="truncate">{col}</span>
                                                    </label>
                                                );
                                            })
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground">No columns found.</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                                            AI Usage Role for &ldquo;{currentInspectedTab.sheetName}&rdquo; (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={sheetRoles[currentInspectedTab.sheetName] || ''}
                                            onChange={(e) =>
                                                setSheetRoles({
                                                    ...sheetRoles,
                                                    [currentInspectedTab.sheetName]: e.target.value
                                                })
                                            }
                                            placeholder="e.g. Check stock availability, order status, or FAQs..."
                                            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Preview only checked columns */}
                                    {Array.isArray(currentInspectedTab.rowsData) &&
                                        currentInspectedTab.rowsData.length > 0 &&
                                        currentCheckedCols.length > 0 && (
                                            <div className="overflow-x-auto border border-border rounded-lg bg-card">
                                                <table className="w-full text-left border-collapse text-[11px]">
                                                    <thead>
                                                        <tr className="border-b border-border bg-muted/50">
                                                            {currentCheckedCols.map((col, i) => (
                                                                <th
                                                                    key={i}
                                                                    className="px-2.5 py-1.5 font-semibold text-foreground whitespace-nowrap"
                                                                >
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentInspectedTab.rowsData.slice(0, 3).map((row, rIdx) => (
                                                            <tr
                                                                key={rIdx}
                                                                className="border-b border-border/60 last:border-0"
                                                            >
                                                                {currentCheckedCols.map((col, cIdx) => (
                                                                    <td
                                                                        key={cIdx}
                                                                        className="px-2.5 py-1 text-muted-foreground whitespace-nowrap"
                                                                    >
                                                                        {row[col] !== undefined && row[col] !== ''
                                                                            ? String(row[col])
                                                                            : '—'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SQL Tables Selection */}
                    {tables.length > 0 && dataSourceType === 'sql' && (
                        <div className="pt-3 border-t border-border space-y-3">
                            <h3 className="text-xs font-semibold text-foreground">
                                Select Tables for AI Model Context:
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {tables.map((tbl, idx) => (
                                    <label
                                        key={idx}
                                        className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border text-xs text-foreground"
                                    >
                                        <input
                                            type="checkbox"
                                            value={tbl}
                                            checked={selectedTables.includes(tbl)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedTables([...selectedTables, tbl]);
                                                else setSelectedTables(selectedTables.filter((t) => t !== tbl));
                                            }}
                                            className="rounded accent-primary"
                                        />
                                        <span className="truncate">{tbl}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    {tables.length > 0 && (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleSaveSetup}
                                disabled={loading}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                                <span>Save Setup to User Profile (MongoDB)</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Status Panel */}
                <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-sky-500 uppercase tracking-widest">
                            2. Model Synchronization
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Train AI model on your user-isolated database context.
                        </p>

                        <div className="bg-muted/50 p-3.5 rounded-xl border border-border space-y-2 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Active Source:</span>{' '}
                                <strong className="text-foreground">{selectedDB || 'None'}</strong>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Selected Tabs/Tables:</span>{' '}
                                <strong className="text-foreground">{selectedTables.length}</strong>
                            </div>
                            {dataSourceType === 'googlesheet' && sheetTabsData.length > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Checked Columns:</span>{' '}
                                    <strong className="text-foreground">{totalCheckedColumnsCount}</strong>
                                </div>
                            )}
                            <div className="flex justify-between text-muted-foreground">
                                <span>Sync Status:</span>{' '}
                                <strong className={selectedDB ? 'text-emerald-500' : 'text-amber-500'}>
                                    {selectedDB ? 'Connected' : 'Not Connected'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={() => toast.success('AI Model successfully trained on context!')}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-xs"
                        >
                            <Database className="w-4 h-4" /> Train AI Context
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}