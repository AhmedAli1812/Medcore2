*** Begin Patch
*** Update File: views\AdminView.tsx
@@
-  const [activeTab, setActiveTab] = useState<'matrix' | 'doctors'>('matrix');
+  const [activeTab, setActiveTab] = useState<'matrix' | 'doctors' | 'reports'>('matrix');
@@
-        <button 
+        <button 
           onClick={() => setActiveTab('matrix')}
@@
         </button>
         <button 
           onClick={() => setActiveTab('doctors')}
@@
         </button>
+        <button 
+          onClick={() => setActiveTab('reports')}
+          className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
+        >
+          <Activity className="w-4 h-4 ml-2" /> تقارير
+        </button>
       </div>
*** End Patch