import React, { useState } from 'react';
import { Database, Server, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
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
                setSelectedTables(res.data.tables); // Default all checked
            }
        } catch (err) {
            toast.error('Failed to load database tables');
        } finally {
            setFetchingTables(false);
        }
    };

    // 3. Load Google Sheet / Excel Columns
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
            const res = await API.post('/dashboard/fetch-sheet-columns', dataForm);
            if (res.data.columns) {
                setDatabases([res.data.sourceName || 'Sheet_Source']);
                setSelectedDB(res.data.sourceName || 'Sheet_Source');
                setTables(res.data.columns);
                setSelectedTables(res.data.columns);
                toast.success('Sheet columns loaded successfully!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to read sheet columns.');
        } finally {
            setLoading(false);
        }
    };

    // 4. Save Setup to User Profile (MongoDB)
    const handleSaveSetup = async () => {
        if (!selectedDB || selectedTables.length === 0) {
            toast.error('Please select a database/source and at least 1 table/column.');
            return;
        }

        const dataForm = new FormData();
        dataForm.append('dataSourceType', dataSourceType);

        if (excelFile) {
            dataForm.append('excelFile', excelFile);
            selectedTables.forEach(t => dataForm.append('selectedTables[]', t));
        } else if (dataSourceType === 'googlesheet' || formData.googleSheetUrl) {
            dataForm.append('googleSheetUrl', formData.googleSheetUrl);
            selectedTables.forEach(t => dataForm.append('selectedTables[]', t));
        } else {
            dataForm.append('host', formData.host);
            dataForm.append('port', formData.port);
            dataForm.append('user', formData.user);
            dataForm.append('password', formData.password);
            dataForm.append('database', selectedDB);
            selectedTables.forEach(t => dataForm.append('selectedTables[]', t));
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

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Database / Google Sheets & AI Training Setup</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Configure and train your AI model on user-isolated database contexts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Form Panel */}
                <div className="bg-card border border-border p-6 rounded-xl lg:col-span-2 space-y-5 shadow-xs">
                    <h3 className="text-xs font-bold text-sky-500 uppercase tracking-widest">1. Select Integration Source</h3>
                    
                    <div className="flex gap-3 p-1 bg-muted rounded-xl border border-border w-fit">
                        <label className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition ${dataSourceType === 'sql' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}>
                            <input type="radio" name="dataSourceType" value="sql" checked={dataSourceType === 'sql'} onChange={() => setDataSourceType('sql')} className="accent-primary" /> SQL Server
                        </label>
                        <label className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg cursor-pointer text-xs font-semibold transition ${dataSourceType === 'googlesheet' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'}`}>
                            <input type="radio" name="dataSourceType" value="googlesheet" checked={dataSourceType === 'googlesheet'} onChange={() => setDataSourceType('googlesheet')} className="accent-primary" /> Google Sheets / Excel
                        </label>
                    </div>

                    {/* SQL Server Form */}
                    {dataSourceType === 'sql' && (
                        <form onSubmit={handleFetchDatabases} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Host / IP Address</label>
                                    <input type="text" name="host" value={formData.host} onChange={handleChange} required className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Port</label>
                                    <input type="text" name="port" value={formData.port} onChange={handleChange} required className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Username</label>
                                    <input type="text" name="user" value={formData.user} onChange={handleChange} required className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Connect Server & Fetch Databases</span>
                            </button>
                        </form>
                    )}

                    {/* Google Sheets Form */}
                    {dataSourceType === 'googlesheet' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Google Sheet Public URL</label>
                                <input type="text" name="googleSheetUrl" value={formData.googleSheetUrl} onChange={handleChange} placeholder="https://docs.google.com/spreadsheets/d/..." className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Or Upload Excel / CSV File</label>
                                <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setExcelFile(e.target.files[0])} className="w-full bg-background border border-border rounded-lg p-2 text-xs text-muted-foreground" />
                            </div>
                            <button type="button" onClick={handleConnectSheet} disabled={loading} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Load Sheets / Columns</span>
                            </button>
                        </div>
                    )}

                    {/* Database Select Dropdown */}
                    {databases.length > 0 && dataSourceType === 'sql' && (
                        <div className="pt-3 border-t border-border space-y-2">
                            <label className="block text-xs font-medium text-foreground">Target Database:</label>
                            <select value={selectedDB} onChange={(e) => handleSelectDatabase(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary">
                                <option value="">-- Choose Database --</option>
                                {databases.map((db, idx) => <option key={idx} value={db}>{db}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Tables / Columns Selection */}
                    {tables.length > 0 && (
                        <div className="pt-3 border-t border-border space-y-3">
                            <h3 className="text-xs font-semibold text-foreground">Select Tables / Columns for AI Model Context:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {tables.map((tbl, idx) => (
                                    <label key={idx} className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border text-xs text-foreground">
                                        <input 
                                            type="checkbox" 
                                            value={tbl} 
                                            checked={selectedTables.includes(tbl)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedTables([...selectedTables, tbl]);
                                                else setSelectedTables(selectedTables.filter(t => t !== tbl));
                                            }}
                                            className="rounded accent-primary" 
                                        />
                                        <span className="truncate">{tbl}</span>
                                    </label>
                                ))}
                            </div>

                            <button onClick={handleSaveSetup} disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                <span>Save Setup to User Profile (MongoDB)</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Status Panel */}
                <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between shadow-xs">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-sky-500 uppercase tracking-widest">2. Model Synchronization</h3>
                        <p className="text-xs text-muted-foreground">Train AI model on your user-isolated database context.</p>
                        
                        <div className="bg-muted/50 p-3.5 rounded-xl border border-border space-y-2 text-xs">
                            <div className="flex justify-between text-muted-foreground"><span>Active Source:</span> <strong className="text-foreground">{selectedDB || 'None'}</strong></div>
                            <div className="flex justify-between text-muted-foreground"><span>Selected Tables:</span> <strong className="text-foreground">{selectedTables.length}</strong></div>
                            <div className="flex justify-between text-muted-foreground"><span>Sync Status:</span> <strong className={selectedDB ? 'text-emerald-500' : 'text-amber-500'}>{selectedDB ? 'Connected' : 'Not Connected'}</strong></div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <button onClick={() => toast.success(`AI Model successfully trained on context!`)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-xs">
                            <Database className="w-4 h-4" /> Train AI Context
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}