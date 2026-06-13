import React from "react";
import { Sparkles, ArrowRight, Video, Target, Award, Eye } from "lucide-react";
import { Campaign } from "../types";

interface PromptTemplatesViewProps {
  onSelectTemplate: (template: Partial<Campaign>) => void;
}

export default function PromptTemplatesView({ onSelectTemplate }: PromptTemplatesViewProps) {
  const templates = [
    {
      title: "Affiliate Shopee Video Hook Formula",
      tag: "Best for Shopee / TikTok Affiliate",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
      description: "Formula ini berfokus pada hook masalah dalam 3 detik pertama, diikuti pembuktian klaim manfaat secara langsung secara visual kasar (lifestyle), dan diakhiri CTA cek keranjang kuning.",
      productName: "Smart Thermos Flask Smart Temp",
      productCategory: "Home / Kitchen",
      productDescription: "Thermos stainless steel dengan penunjuk temperatur LED di bagian tutup. Menjaga suhu air panas hingga 24 jam.",
      benefits: "Mengetahui temperatur air secara instan tanpa perlu mencicipi\nAir tetap panas hingga kopi seduhan pagi berikutnya\nTutup berbahan food-grade silikon pencegah tumpahan",
      keyPoints: "Sensor LED instan, Food-grade 304, Tahan 24 Jam, Kapasitas 500ml",
      platform: "Shopee Video",
      totalDuration: 15,
      sceneCount: 4,
      visualPreset: "Home Lifestyle",
      useModelReference: false,
      narrationTone: "Urgent",
      ctaType: "Cek keranjang kuning"
    },
    {
      title: "Automotive Premium Detailer Studio",
      tag: "Deep Cinematic Shadows",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Cocok untuk produk oli mesin, wax mobil, atau premium coating. Menghasilkan visual cinematic gelap berkelas tinggi dengan sorotan cahaya dramatis ke botol kemasan.",
      productName: "MaxSpeed Synth Engine Oil",
      productCategory: "Automotive / Oil",
      productDescription: "Oli pelumas sintetis 10W-40 untuk perlindungan mesin motor sport di temperatur ekstrem tinggi.",
      benefits: "Melindungi keausan mesin dari putaran RPM tinggi\nSuara getaran kasar mesin mereda seketika\nMengurangi konsumsi bahan bakar hingga berkendara lebih jauh",
      keyPoints: "Full Synthetic Ester, SAE 10W-40, API SN, JASO MA2",
      platform: "Instagram Reels",
      totalDuration: 20,
      sceneCount: 4,
      visualPreset: "Product Premium",
      useModelReference: false,
      narrationTone: "Review style",
      ctaType: "Klik link di bio"
    },
    {
      title: "Cosmetic Glow Soft-Selling Storyboard",
      tag: "Beauty & Skin Wellness",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
      description: "Fokus pada struktur visual yang tenang, rileks, dan bersih. Menampilkan tekstur serum/cream wajah di latar belakang putih studio minimalis.",
      productName: "UltraGlow Niacinamide Serum",
      productCategory: "Beauty / Cosmetics",
      productDescription: "Serum harian pencerah noda hitam dengan kandungan Niacinamide 10% dan ekstrak Centella Asiatica hangat.",
      benefits: "Memudarkan noda hitam bekas jerawat dalam 7 hari\nMembantu menenangkan kulit kemerahan sensitif\nMengunci hidrasi kelembaban kulit sepanjang malam",
      keyPoints: "10% Niacinamide, Alcohol free, Paraben free, Clinical tested",
      platform: "TikTok",
      totalDuration: 15,
      sceneCount: 4,
      visualPreset: "Marketplace Clean",
      useModelReference: true,
      modelType: "Real Person",
      modelUsage: "Product holder",
      modelReferenceNotes: "Wajah glowing bersih natural, menggunakan pakaian kasual warna beige",
      narrationTone: "Friendly",
      ctaType: "Klik produk sekarang"
    },
    {
      title: "Cool Tech Gadget Showcase Sequence",
      tag: "Futuristic & Clean",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      description: "Didesain khusus untuk produk elektronik portabel, keyboard, mouse, smartwatch. Menampilkan detail-detail spesifikasi makro close-up secara presisi.",
      productName: "AirSound X-7 Pro Noise Canceling Earbuds",
      productCategory: "Gadget",
      productDescription: "Wireless Bluetooth earbuds dengan Active Noise Cancelation (ANC) up to 40dB dan dynamic bass driver.",
      benefits: "Hening instan meredam suara hiruk-pikuk bising sekitar\nBaterai super awet bertahan tanpa jeda hingga 36 jam\nSuara dentuman bass tetap jernih berkat dynamic driver",
      keyPoints: "ANC -40dB, 36 Hours Battery, Bluetooth 5.3, IPX5 Waterproof",
      platform: "YouTube Shorts",
      totalDuration: 30,
      sceneCount: 5,
      visualPreset: "Product Detail",
      useModelReference: true,
      modelType: "Hand Model Only",
      modelUsage: "Hand-only product demo",
      modelReferenceNotes: "Gunakan model tangan bersih melakukan interaksi tap kontrol earbuds",
      narrationTone: "Edukatif",
      ctaType: "Beli sekarang"
    }
  ];

  return (
    <div id="prompt-templates-section" className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Visual Formulas & Prompt Templates
        </h1>
        <p className="text-slate-500 mt-1 max-w-2xl text-sm">
          Pilih formula storyboarding video berkonversi tinggi yang dirancang oleh ahli kreatif. Klik gunakan untuk mengisi Product Brief instan!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono uppercase ${tpl.badgeColor}`}>
                  {tpl.tag}
                </span>
                <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                  <Video size={13} />
                  {tpl.totalDuration}s ({tpl.sceneCount} scenes)
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {tpl.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {tpl.description}
              </p>

              {/* Summary metadata specs inside template card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/80 text-[11px] space-y-1.5 font-mono">
                <div>
                  <span className="text-slate-400 font-semibold uppercase">Product: </span>
                  <span className="text-slate-700 font-bold">{tpl.productName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase">Preset: </span>
                  <span className="text-slate-700 font-bold">{tpl.visualPreset}</span>
                </div>
              </div>
            </div>

            {/* Load hook */}
            <div className="mt-5 border-t border-slate-100 pt-3.5 text-right">
              <button
                onClick={() => onSelectTemplate(tpl)}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                Gunakan Formula Ini
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
