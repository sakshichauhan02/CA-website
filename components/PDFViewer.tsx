'use client';







interface PDFViewerProps {
  file: string;
}

export default function PDFViewer({ file }: PDFViewerProps) {


  return (
    <div className="w-full h-[80vh] min-h-[600px] bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl relative">
      <iframe 
        src={`${file}#toolbar=0`}
        className="w-full h-full border-none"
        title="PDF Viewer"
      />
      
      {/* Overlay to maintain premium feel and prevent unwanted interactions if needed */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
    </div>
  );
}

