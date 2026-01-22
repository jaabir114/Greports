
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  Archive, 
  Download, 
  Trash2, 
  Plus, 
  Languages, 
  Building2, 
  User,
  Type as TypeIcon,
  Image as ImageIcon,
  Loader2,
  Menu,
  X,
  RefreshCcw,
  Sparkles,
  MessageSquare,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Language, ReportType, Report, ReportConfig, ReportTypeTranslations } from './types';
import { generateProfessionalReport } from './geminiService';
import { exportToWord } from './utils/wordExporter';

const App: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ReportConfig>({
    type: ReportType.FORMAL,
    recipient: '',
    senderName: '',
    language: Language.ARABIC,
    topic: '',
    details: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refinementText, setRefinementText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Saved Data
  useEffect(() => {
    const savedReports = localStorage.getItem('smart_sec_reports');
    if (savedReports) {
      try { setReports(JSON.parse(savedReports)); } catch (e) { console.error("Load error", e); }
    }
    const savedName = localStorage.getItem('smart_sec_name');
    if (savedName) setCurrentConfig(prev => ({ ...prev, senderName: savedName }));
  }, []);

  // Sync Reports
  useEffect(() => {
    localStorage.setItem('smart_sec_reports', JSON.stringify(reports));
  }, [reports]);

  const handleGenerate = async () => {
    if (!currentConfig.topic || !currentConfig.recipient || !currentConfig.senderName) {
      alert(currentConfig.language === Language.ARABIC ? "يا غالي، يرجى تعبئة كافة الحقول (المرسل، المستلم، الموضوع)" : "Please fill all fields.");
      return;
    }

    localStorage.setItem('smart_sec_name', currentConfig.senderName);
    setIsGenerating(true);
    try {
      const content = await generateProfessionalReport(currentConfig);
      const newReport: Report = {
        id: Date.now().toString(),
        title: currentConfig.topic,
        content,
        type: currentConfig.type,
        recipient: currentConfig.recipient,
        senderName: currentConfig.senderName,
        language: currentConfig.language,
        logoUrl: currentConfig.logoUrl,
        createdAt: Date.now()
      };
      setReports([newReport, ...reports]);
      setActiveReport(newReport);
    } catch (error) {
      alert("عذراً، حدث خطأ في النظام الذكي.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!activeReport || !refinementText) return;
    setIsGenerating(true);
    try {
      const newContent = await generateProfessionalReport(
        { ...currentConfig, language: activeReport.language, type: activeReport.type, recipient: activeReport.recipient, topic: activeReport.title, senderName: activeReport.senderName, details: '' },
        activeReport.content,
        refinementText
      );
      const updated = { ...activeReport, content: newContent };
      setReports(reports.map(r => r.id === activeReport.id ? updated : r));
      setActiveReport(updated);
      setRefinementText('');
    } catch (e) { alert("فشل التعديل"); }
    finally { setIsGenerating(false); }
  };

  const isRtl = (activeReport?.language === Language.ARABIC) || (!activeReport && currentConfig.language === Language.ARABIC);
  const translations = ReportTypeTranslations[activeReport?.language || currentConfig.language];

  return (
    <div className={`flex h-screen bg-slate-100 text-slate-900 ${isRtl ? 'flex-row-reverse font-["Tajawal"]' : 'font-["Inter"]'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Mobile Toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`fixed top-4 z-50 p-3 bg-slate-900 text-white rounded-full shadow-xl lg:hidden ${isRtl ? 'left-4' : 'right-4'}`}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300 bg-slate-900 text-white flex flex-col z-40 fixed lg:relative h-full border-x border-slate-800 shadow-2xl`}>
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">السكرتير الذكي</h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Master Office AI</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <button 
            onClick={() => { setActiveReport(null); if(window.innerWidth < 1024) setSidebarOpen(false); }}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            <Plus size={20} />
            {isRtl ? 'مستند جديد' : 'New Document'}
          </button>

          <div>
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] mb-4 flex items-center gap-2">
              <Archive size={14} /> {isRtl ? 'الأرشيف الذكي' : 'Smart Archive'}
            </h2>
            <div className="space-y-3">
              {reports.length === 0 && <p className="text-slate-600 text-xs text-center italic mt-10">لا يوجد تقارير محفوظة</p>}
              {reports.map(report => (
                <div 
                  key={report.id}
                  onClick={() => { setActiveReport(report); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                  className={`group p-4 rounded-2xl border border-slate-800 cursor-pointer transition-all ${activeReport?.id === report.id ? 'bg-slate-800 border-amber-500/40 shadow-lg' : 'hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.stopPropagation(); setReports(reports.filter(r => r.id !== report.id)); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"><Trash2 size={12} /></button>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{report.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{report.recipient}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-800 text-[9px] text-slate-600 text-center font-bold tracking-widest">
          EXPERTISE AI v2.5 PRESTIGE
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-4">
            {activeReport && (
              <div className="flex gap-3">
                <button onClick={() => exportToWord(activeReport)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-xl transition-all active:scale-95 group">
                  <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> 
                  {isRtl ? 'تنزيل ملف وورد (للصياغة)' : 'Export MS Word'}
                </button>
                <button onClick={() => setActiveReport(null)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Professional Identity</p>
              <p className="text-sm font-black text-slate-800">{isRtl ? 'السكرتارية التنفيذية' : 'Executive Secretariat'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><User size={20} /></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          
          {/* Loader Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 text-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" size={32} />
                </div>
                <div>
                  <h3 className="text-white text-xl font-black mb-2">{isRtl ? 'جاري الصياغة الرسمية...' : 'Composing Official Draft...'}</h3>
                  <p className="text-slate-400 text-sm max-w-[250px]">{isRtl ? 'أقوم حالياً بتحليل البيانات وتنسيقها بأفضل أسلوب إداري معاصر.' : 'Expert secretary is weaving your details into a masterpiece.'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            
            {!activeReport ? (
              /* Config Editor */
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black mb-2">{isRtl ? 'محرر الصياغة' : 'Drafting Hub'}</h2>
                    <p className="text-slate-400 font-bold">{isRtl ? 'زودني بالتفاصيل وسأحولها لخطاب رسمي مبهر.' : 'Provide the core, I deliver the polish.'}</p>
                  </div>
                  <FileCheck size={48} className="text-amber-500/50" />
                </div>

                <div className="p-10 space-y-10">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'شعار الجهة الرسمية' : 'Entity Logo'}</label>
                    <div onClick={() => fileInputRef.current?.click()} className="border-3 border-dashed border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group">
                      {currentConfig.logoUrl ? (
                        <div className="relative group">
                          <img src={currentConfig.logoUrl} className="h-32 object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold rounded-lg transition-all">تغيير</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto text-slate-200 group-hover:text-amber-500 transition-colors mb-3" size={48} />
                          <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{isRtl ? 'اضغط لرفع الشعار' : 'Click to Upload'}</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setCurrentConfig({...currentConfig, logoUrl: reader.result as string});
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase"><User size={14} /> {isRtl ? 'اسمك (الموقع على الخطاب)' : 'Signatory Name'}</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold transition-all" placeholder={isRtl ? 'اسمك الكريم بلقبك الوظيفي' : 'Your full name & title'} value={currentConfig.senderName} onChange={e => setCurrentConfig({...currentConfig, senderName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase"><Building2 size={14} /> {isRtl ? 'الجهة المستلمة' : 'Recipient'}</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold transition-all" placeholder={isRtl ? 'لمن نوجه الخطاب؟' : 'Who is this for?'} value={currentConfig.recipient} onChange={e => setCurrentConfig({...currentConfig, recipient: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase"><TypeIcon size={14} /> {isRtl ? 'نوع المستند' : 'Type'}</label>
                      <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none font-bold appearance-none cursor-pointer" value={currentConfig.type} onChange={e => setCurrentConfig({...currentConfig, type: e.target.value as ReportType})}>
                        {Object.values(ReportType).map(t => <option key={t} value={t}>{translations[t]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase"><Languages size={14} /> {isRtl ? 'اللغة' : 'Language'}</label>
                      <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none font-bold" value={currentConfig.language} onChange={e => setCurrentConfig({...currentConfig, language: e.target.value as Language})}>
                        <option value={Language.ARABIC}>اللغة العربية الفصحى</option>
                        <option value={Language.SOMALI}>Af-Soomaali Rasmi ah</option>
                        <option value={Language.ENGLISH}>Professional English</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'الموضوع الرئيسي' : 'Main Subject'}</label>
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none font-bold" placeholder={isRtl ? 'عنوان المستند المباشر' : 'Topic of the document'} value={currentConfig.topic} onChange={e => setCurrentConfig({...currentConfig, topic: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isRtl ? 'التفاصيل (أهم النقاط)' : 'Core Details'}</label>
                    <textarea rows={5} className="w-full px-5 py-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-amber-500 outline-none font-medium resize-none" placeholder={isRtl ? 'اكتب النقاط الأساسية التي تريد تضمينها وسأقوم بصياغتها بذكاء...' : 'List facts or points you want me to weave into the document...'} value={currentConfig.details} onChange={e => setCurrentConfig({...currentConfig, details: e.target.value})} />
                  </div>

                  <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl hover:scale-[1.01] active:scale-95 disabled:opacity-50">
                    <Sparkles size={24} className="text-amber-500" /> 
                    {isRtl ? 'ابدأ الصياغة الذكية الآن' : 'Draft Document Now'}
                  </button>
                </div>
              </div>
            ) : (
              /* Report Viewer & Chat */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                
                {/* A4 Paper Preview */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col items-center p-6 md:p-12">
                   <div className="w-full max-w-[210mm] bg-white p-[20mm] md:p-[25mm] shadow-sm border border-slate-100 min-h-[297mm] flex flex-col text-slate-900 relative">
                      
                      {/* Paper Header */}
                      <div className="flex justify-between items-start mb-16 pb-10 border-b-2 border-slate-900/5">
                        <div className="max-w-[50%]">
                          {activeReport.logoUrl ? (
                            <img src={activeReport.logoUrl} className="h-28 object-contain mb-6 drop-shadow-sm" />
                          ) : (
                            <div className="text-xs font-black border-2 border-slate-900 p-2 inline-block mb-4 uppercase">{activeReport.recipient}</div>
                          )}
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400">REF: SEC-{activeReport.id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">CLASS: OFFICIAL DOCUMENT</p>
                          </div>
                        </div>
                        <div className={`text-${isRtl ? 'right' : 'left'} flex flex-col items-${isRtl ? 'start' : 'end'}`}>
                          <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase mb-6">{translations[activeReport.type]}</div>
                          <p className="text-xs font-black text-slate-400 mb-1">{new Date(activeReport.createdAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { dateStyle: 'full' })}</p>
                          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">{activeReport.title}</h1>
                          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{isRtl ? 'موجه إلى: ' : 'To: '} {activeReport.recipient}</p>
                        </div>
                      </div>

                      {/* Paper Body */}
                      <div className={`flex-1 text-slate-800 leading-[1.9] text-xl ${activeReport.language === Language.ARABIC ? 'classic-font text-2xl' : 'font-serif'} whitespace-pre-line text-justify`}>
                        {activeReport.content}
                      </div>

                      {/* Paper Footer */}
                      <div className={`mt-20 pt-10 border-t border-slate-50 flex flex-col items-${isRtl ? 'start' : 'end'} ${isRtl ? 'text-right' : 'text-left'}`}>
                         <p className="text-sm font-bold text-slate-400 mb-6">{isRtl ? 'وتقبلوا خالص التحيات،' : 'With warm regards,'}</p>
                         <div className="text-center">
                            <p className="text-2xl font-black text-slate-900 mb-1">{activeReport.senderName}</p>
                            <div className="h-[1px] w-24 bg-slate-200 mx-auto mb-2"></div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{translations[activeReport.type]}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Intelligent Chat Box */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white transform hover:scale-[1.01] transition-all border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900"><MessageSquare size={16} /></div>
                    <h4 className="text-lg font-black">{isRtl ? 'دردشة التعديل الذكي (اطلب أي تغيير)' : 'Document Refinement Chat'}</h4>
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      className="flex-1 bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all" 
                      placeholder={isRtl ? 'أخبرني كيف أعدل النص؟ مثلاً: "اجعل النبرة أكثر رسمية" أو "أضف فقرة عن..."' : 'How should I change this? (e.g., "Make it shorter" or "Add a bullet list about...")'} 
                      value={refinementText} 
                      onChange={e => setRefinementText(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && handleRefine()} 
                    />
                    <button 
                      onClick={handleRefine} 
                      disabled={isGenerating || !refinementText} 
                      className="px-8 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50"
                    >
                      {isGenerating ? <RefreshCcw size={24} className="animate-spin" /> : <ChevronRight size={24} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 text-center font-bold tracking-widest uppercase">Your AI Secretary is ready to iterate as many times as you need.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
