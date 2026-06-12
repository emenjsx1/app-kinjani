import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cloud, Sparkles, Image, FileText, Video, AudioLines, UploadCloud, 
  MoreVertical, Play, Download, Search, Filter, Grid, List, Plus
} from "lucide-react";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  size: string;
  date: string;
  url: string;
  placeholderIcon?: any;
}

const initialFiles: MediaFile[] = [
  {
    name: "abstract_hero_render.png",
    type: "image",
    size: "2.4 MB",
    date: "12 Ago 2024",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8Sm3Li5a7DWxxxggX-CWwkCtgz1q_xe7zujnvRp510W_bg9IABFa4Ej4BbQN5d7vgWRIfauBALq998aLpUNEB0e75dknxf3ytW4r7eBET8whlb9VGSvuXCPFFNjm3zJ02ULsjVPA1qm6jqWw5EgNVYEdyOs3nJzBRpQARDnJzqO_CjVeV1KQ_iltAdbxyqXuvKxvTzOC0nbKSa1vWJqj89jowG9Q1FM07IP3S7NMcCpMXQS0J0bUiUC5lr9S2O9F7j40usge2lL64"
  },
  {
    name: "product_demo_4k.mp4",
    type: "video",
    size: "145.8 MB",
    date: "Agora mesmo",
    url: "",
  },
  {
    name: "network_node_01.jpg",
    type: "image",
    size: "8.2 MB",
    date: "Há 2 dias",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbJK3ZXFyJg7nACcSrdaibueTx9sqXzW0sN__B-B7MWHfZYxyoMEiF8VtV6KH2TVap22gKSFQYWLZNDFmZZJgDqxcYEXWQbepoirb2fYzWNRLX_d_qrNhp6ujTHccUVotGK8WlT24Esx336fKKoBtiQiTgpKvCsdOJUvEXdjjEQPoJcEX6x3GxnrrHcgPdraqS5aE_4AGbO-28Op0PwtPyZYqMz-ZK15K6d7n-hMyGCqb_G7Q1Wk8fcR49Wm7wEz786rcaqYyuBIIf"
  },
  {
    name: "architecture_v2.pdf",
    type: "document",
    size: "12.4 MB",
    date: "10 Ago 2024",
    url: "",
  }
];

export default function CloudPage() {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    toast.success("Processamento de ficheiro iniciado no core do AetherFactory...");
  };

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-primary" />;
      case 'video': return <Video className="h-5 w-5 text-secondary" />;
      case 'document': return <FileText className="h-5 w-5 text-pistachio" />;
      case 'audio': return <AudioLines className="h-5 w-5 text-primary" />;
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout pageTitle="Mídia Cloud" credits={0}>
      <div className="space-y-8 pb-12">
        
        {/* Header Actions */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-display">
              Media Assets
            </h1>
            <p className="text-sm text-pistachio">
              Gerencie seus recursos de mídia e arquivos distribuídos na nuvem.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pistachio/40 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card/40 border border-forest/30 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-pistachio/30 w-64"
              />
            </div>
            
            <div className="bg-card/40 border border-forest/30 rounded-lg p-1 flex items-center gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-forest/40 text-primary' : 'text-pistachio hover:text-white'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-forest/40 text-primary' : 'text-pistachio hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Usage & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Storage Meter */}
          <div className="lg:col-span-4 bg-card/40 border border-forest/20 p-6 rounded-2xl relative overflow-hidden group backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-bold text-white font-display">Capacidade de Armazenamento</h3>
                <p className="text-xs text-pistachio mt-0.5">78% de 2TB utilizados</p>
              </div>
              <Cloud className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-4">
              <div className="h-3 w-full bg-forest/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: '78%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-pistachio/50 uppercase tracking-widest font-bold">Usado</p>
                  <p className="text-lg font-bold text-white font-mono mt-0.5">1.56 TB</p>
                </div>
                <div>
                  <p className="text-[10px] text-pistachio/50 uppercase tracking-widest font-bold">Disponível</p>
                  <p className="text-lg font-bold text-secondary font-mono mt-0.5">0.44 TB</p>
                </div>
              </div>
            </div>

            {/* Live Sync Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/50 px-2 py-1 rounded border border-forest/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[9px] font-bold text-primary uppercase">Sincronização</span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="lg:col-span-8 bg-card/40 border border-forest/20 p-6 rounded-2xl flex items-center backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-center">
              <button className="bg-forest/20 border border-primary/40 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-forest/40 transition-all group">
                <Image className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Imagens</span>
                <span className="text-[10px] text-pistachio/60">1.240 ficheiros</span>
              </button>
              
              <button className="bg-background/40 border border-forest/20 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-forest/20 transition-all group">
                <FileText className="h-6 w-6 text-pistachio group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Documentos</span>
                <span className="text-[10px] text-pistachio/60">458 ficheiros</span>
              </button>

              <button className="bg-background/40 border border-forest/20 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-forest/20 transition-all group">
                <Video className="h-6 w-6 text-pistachio group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Vídeos</span>
                <span className="text-[10px] text-pistachio/60">89 ficheiros</span>
              </button>

              <button className="bg-background/40 border border-forest/20 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-forest/20 transition-all group">
                <AudioLines className="h-6 w-6 text-pistachio group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Áudios</span>
                <span className="text-[10px] text-pistachio/60">212 ficheiros</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-forest/40 bg-card/25 rounded-2xl p-12 flex flex-col items-center justify-center transition-all hover:border-primary/60 hover:bg-primary/5 group cursor-pointer text-center"
        >
          <div className="w-16 h-16 bg-forest/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Arraste e solte seus assets</h3>
          <p className="text-xs text-pistachio/50 mt-1">Suporte para PNG, JPG, MP4, PDF até 2GB</p>
          <Button variant="outline" className="mt-6 border-forest/30 text-white hover:bg-forest/20 text-xs font-semibold py-2 px-6 rounded-full">
            Escolher Arquivos
          </Button>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file, idx) => (
            <div 
              key={idx}
              className="bg-card/40 border border-forest/30 rounded-2xl overflow-hidden flex flex-col group hover:translate-y-[-4px] hover:border-primary/40 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(69,253,148,0.05)]"
            >
              <div className="h-40 bg-background/50 relative overflow-hidden flex items-center justify-center">
                {file.url ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-pistachio/30 gap-2">
                    {file.type === 'video' ? <Video className="h-10 w-10 text-primary" /> : <FileText className="h-10 w-10 text-pistachio" />}
                    {file.type === 'video' && (
                      <Button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 p-0 hover:scale-105 transition-transform absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Play className="h-4 w-4 fill-current text-white" />
                      </Button>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <span className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                    {file.type}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-white truncate pr-4">{file.name}</h4>
                  <button className="text-pistachio hover:text-primary"><MoreVertical className="h-4 w-4" /></button>
                </div>
                <div className="flex justify-between text-pistachio/60 text-xs font-mono">
                  <span>{file.size}</span>
                  <span>{file.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
