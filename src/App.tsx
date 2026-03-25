/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Leaf, 
  Truck, 
  FileText, 
  Settings, 
  Info, 
  Activity, 
  Thermometer, 
  Zap, 
  Weight, 
  Calendar,
  Globe,
  Home,
  ChevronDown,
  ExternalLink,
  Share2,
  Recycle,
  Heart,
  ArrowLeft,
  Palette,
  List,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  Database,
  Scissors,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList,
  Legend 
} from 'recharts';
import { mockDPP, mockCertificates, mockLogistics, mockCarbonData, mockCarbonSavings } from './mockData';
import { DataClassification, SourceType } from './types';

// Helper Components for Core Business Domain Display
const DataBadge: React.FC<{ 
  classification: DataClassification; 
  source: SourceType; 
  index: string;
  hash?: string;
  createdAt?: string;
}> = ({ classification, source, index, hash, createdAt }) => {
  const getClassificationColor = (c: DataClassification) => {
    switch (c) {
      case 'PUBLIC': return 'bg-green-50 text-green-600 border-green-100';
      case 'RESTRICTED': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CONFIDENTIAL': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getSourceColor = (s: SourceType) => {
    switch (s) {
      case 'ENTERPRISE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CERTIFICATE': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'MODEL_EST': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getSourceLabel = (s: SourceType) => {
    switch (s) {
      case 'ENTERPRISE': return '企业 ERP / ERP';
      case 'CERTIFICATE': return '第三方证书 / Cert';
      case 'MODEL_EST': return '模型估算 / Model';
      default: return s;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getClassificationColor(classification)}`}>
        {classification}
      </span>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSourceColor(source)}`}>
        {getSourceLabel(source)}
      </span>
      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-gray-100 bg-gray-50 text-gray-400">
        物理索引 / IDX: {index}
      </span>
      {createdAt && (
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-gray-100 bg-gray-50 text-gray-400">
          存证时间 / TS: {new Date(createdAt).toLocaleDateString()}
        </span>
      )}
      {hash && (
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-100 bg-purple-50 text-purple-400 max-w-[100px] truncate" title={hash}>
          HASH: {hash.substring(0, 8)}...
        </span>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-bold text-gray-800">{value}</p>
  </div>
);

const TableCard: React.FC<{ 
  title: string; 
  data: any[]; 
  columns: { label: string; key: string | ((d: any) => React.ReactNode) }[];
  headerActions?: React.ReactNode;
}> = ({ title, data, columns, headerActions }) => {
  const getSourceColorClass = (s: SourceType) => {
    switch (s) {
      case 'ENTERPRISE': return 'bg-blue-500';
      case 'CERTIFICATE': return 'bg-purple-500';
      case 'MODEL_EST': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Database size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        {headerActions}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-4 w-1"></th>
              {columns.map((col, i) => (
                <th key={i} className="pb-4 font-bold text-gray-400 uppercase text-[10px] px-2">{col.label}</th>
              ))}
              <th className="pb-4 font-bold text-gray-400 uppercase text-[10px] px-2 text-right">元数据 / Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors relative group">
                <td className="py-4 w-1">
                  <div className={`w-1 h-8 rounded-full ${getSourceColorClass(row.sourceType)} opacity-60 group-hover:opacity-100 transition-opacity`} title={row.sourceType}></div>
                </td>
                {columns.map((col, i) => (
                  <td key={i} className="py-4 px-2 font-medium text-gray-700">
                    {typeof col.key === 'function' ? col.key(row) : row[col.key]}
                  </td>
                ))}
                <td className="py-4 px-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className={`w-2 h-2 rounded-full ${getSourceColorClass(row.sourceType)} shadow-sm`} title={row.sourceType}></div>
                    <DataBadge 
                      classification={row.dataClassification} 
                      source={row.sourceType} 
                      index={row.id} 
                      hash={row.blockchainHash} 
                      createdAt={row.createdAt}
                    />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center text-gray-400 italic text-xs">
                  未找到符合筛选条件的数据 / No matching data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductionFlowchart: React.FC = () => {
  const steps = [
    { name: '原材料批次', sub: 'Material Batch', date: '2025-09-28', icon: <Database size={16} />, duration: '34天' },
    { name: '纺纱加工', sub: 'Yarn Spinning', date: '2025-11-01', icon: <Zap size={16} />, duration: '34天' },
    { name: '面料织造', sub: 'Fabric Weaving', date: '2025-12-05', icon: <Settings size={16} />, duration: '38天' },
    { name: '染色整理', sub: 'Dyeing & Finishing', date: '2026-01-12', icon: <Palette size={16} />, duration: '57天' },
    { name: '辅料节点', sub: 'Accessories', date: '2026-03-10', icon: <Layers size={16} />, duration: '5天' },
    { name: '成衣制造', sub: 'Garment Mfg', date: '2026-03-15', icon: <Scissors size={16} />, duration: null },
  ];

  return (
    <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm mb-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">生产全链路流程图 / Production Lifecycle Flow</h3>
            <p className="text-xs text-gray-400">展示各环节顺序、耗时及区块链存证时间 / Sequence, duration and blockchain timestamps</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-start min-w-[900px] justify-between px-4 pb-4">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center group relative cursor-pointer">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 z-10 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
              >
                {step.icon}
              </motion.div>
              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-gray-800">{step.name}</p>
                <p className="text-[9px] text-gray-400 uppercase font-bold">{step.sub}</p>
                <div className="mt-2 py-1 px-2 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-mono">{step.date}</p>
                </div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                已通过区块链核验 / Verified on Chain
              </div>
            </div>
            
            {step.duration && (
              <div className="flex-1 flex flex-col items-center justify-center pt-7 px-2">
                <div className="w-full h-[2px] bg-blue-50 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: idx * 0.3 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-500"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.3 + 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-white px-3 py-1 border border-blue-100 rounded-full shadow-sm flex items-center gap-1.5">
                        <Clock size={10} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-600">{step.duration}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const TABS = [
  { id: 'basic', label: '基本信息 / Basic Info' },
  { id: 'materials', label: '供应链 / Supply Chain' },
  { id: 'carbon', label: '碳足迹 / Carbon Footprint' },
  { id: 'compliance', label: '尽职调查 / Due Diligence' },
  { id: 'logistics', label: '物流信息 / Logistics' },
  { id: 'status', label: '使用状态 / Operating Status' },
  { id: 'passport', label: '数字护照 / Digital Passport' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const suppliers = useMemo(() => {
    const s = new Set<string>();
    mockDPP.materials.materialBatch.forEach(m => s.add(m.supplierName));
    mockDPP.materials.yarnSpinning.forEach(m => s.add(m.factoryName));
    mockDPP.materials.fabricWeaving.forEach(m => s.add(m.factoryName));
    mockDPP.materials.dyeingFinishing.forEach(m => s.add(m.factoryName));
    mockDPP.materials.accessoriesBatch.forEach(m => s.add(m.accessorySupplier));
    s.add(mockDPP.materials.garmentManufacturing.factoryName);
    mockDPP.materials.complianceCerts.forEach(m => s.add(m.issuer));
    mockDPP.materials.qualityControl.forEach(m => s.add(m.inspector));
    s.add(mockDPP.logistics.carrier);
    s.add(mockDPP.issuer);
    return Array.from(s).filter(Boolean).sort();
  }, []);

  const types = useMemo(() => {
    const t = new Set<string>();
    mockDPP.materials.fiberOrigin.forEach(m => t.add(m.fiberType));
    mockDPP.materials.materialBatch.forEach(m => t.add(m.materialName));
    mockDPP.materials.yarnSpinning.forEach(m => t.add(m.spinningMethod));
    mockDPP.materials.fabricWeaving.forEach(m => t.add(m.weaveType));
    mockDPP.materials.dyeingFinishing.forEach(m => t.add(m.dyeType));
    mockDPP.materials.complianceCerts.forEach(m => t.add(m.certType));
    mockDPP.materials.qualityControl.forEach(m => t.add(m.testItem));
    t.add(mockDPP.materials.packagingLabeling.materialType);
    return Array.from(t).filter(Boolean).sort();
  }, []);

  const statuses = useMemo(() => {
    const st = new Set<string>();
    mockDPP.materials.qualityControl.forEach(m => st.add(m.result));
    st.add(mockDPP.logistics.status);
    st.add(mockDPP.status);
    return Array.from(st).filter(Boolean).sort();
  }, []);

  const [yarnSpinningMethodFilter, setYarnSpinningMethodFilter] = useState('ALL');

  const yarnSpinningMethods = useMemo(() => {
    const m = new Set<string>();
    mockDPP.materials.yarnSpinning.forEach(y => m.add(y.spinningMethod));
    return Array.from(m).filter(Boolean).sort();
  }, []);

  const matchesFilter = (item: any, supplierKey?: string, typeKey?: string, statusKey?: string) => {
    const matchesText = !filterText || JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase());
    const matchesSupplier = selectedSupplier === 'ALL' || (supplierKey && item[supplierKey] === selectedSupplier);
    const matchesType = selectedType === 'ALL' || (typeKey && item[typeKey] === selectedType);
    const matchesStatus = selectedStatus === 'ALL' || (statusKey && item[statusKey] === selectedStatus);
    return matchesText && matchesSupplier && matchesType && matchesStatus;
  };

  const filterData = (data: any[], supplierKey?: string, typeKey?: string, statusKey?: string) => {
    return data.filter(item => matchesFilter(item, supplierKey, typeKey, statusKey));
  };

  const isAnySectionVisible = useMemo(() => {
    if (activeTab !== 'materials') return true;
    
    const fiberVisible = matchesFilter({ ...mockDPP.materials.fiberOrigin[0], ...mockDPP.materials.materialBatch[0] }, 'supplierName', 'fiberType');
    const yarnVisible = filterData(mockDPP.materials.yarnSpinning, 'factoryName', 'spinningMethod')
      .filter(y => yarnSpinningMethodFilter === 'ALL' || y.spinningMethod === yarnSpinningMethodFilter).length > 0;
    const fabricVisible = filterData(mockDPP.materials.fabricWeaving, 'factoryName', 'weaveType').length > 0;
    const dyeingVisible = filterData(mockDPP.materials.dyeingFinishing, 'factoryName', 'dyeType').length > 0;
    const accessoriesVisible = filterData(mockDPP.materials.accessoriesBatch, 'accessorySupplier').length > 0;
    const qcVisible = filterData(mockDPP.materials.qualityControl, 'inspector', 'testItem', 'result').length > 0;
    const packagingVisible = matchesFilter(mockDPP.materials.packagingLabeling, undefined, 'materialType');
    const garmentVisible = matchesFilter(mockDPP.materials.garmentManufacturing, 'factoryName');
    const logisticsVisible = matchesFilter(mockDPP.logistics, 'carrier', undefined, 'status');
    const dppVisible = matchesFilter(mockDPP, 'issuer', undefined, 'status');
    const certsVisible = filterData(mockDPP.materials.complianceCerts, 'issuer', 'certType').length > 0;

    return fiberVisible || yarnVisible || fabricVisible || dyeingVisible || accessoriesVisible || qcVisible || packagingVisible || garmentVisible || logisticsVisible || dppVisible || certsVisible;
  }, [activeTab, filterText, selectedSupplier, selectedType, selectedStatus, yarnSpinningMethodFilter, matchesFilter, filterData]);

  const visibleSectionsCount = useMemo(() => {
    if (activeTab !== 'materials') return 0;
    let count = 0;
    if (matchesFilter({ ...mockDPP.materials.fiberOrigin[0], ...mockDPP.materials.materialBatch[0] }, 'supplierName', 'fiberType')) count++;
    if (filterData(mockDPP.materials.yarnSpinning, 'factoryName', 'spinningMethod')
      .filter(y => yarnSpinningMethodFilter === 'ALL' || y.spinningMethod === yarnSpinningMethodFilter).length > 0) count++;
    if (filterData(mockDPP.materials.fabricWeaving, 'factoryName', 'weaveType').length > 0) count++;
    if (filterData(mockDPP.materials.dyeingFinishing, 'factoryName', 'dyeType').length > 0) count++;
    if (filterData(mockDPP.materials.accessoriesBatch, 'accessorySupplier', 'color', 'size').length > 0) count++;
    if (filterData(mockDPP.materials.qualityControl, 'inspector', 'testItem', 'result').length > 0) count++;
    if (matchesFilter(mockDPP.materials.packagingLabeling, undefined, 'materialType')) count++;
    if (matchesFilter(mockDPP.materials.garmentManufacturing, 'factoryName')) count++;
    if (matchesFilter(mockDPP.logistics, 'carrier', undefined, 'status')) count++;
    if (matchesFilter(mockDPP, 'issuer', undefined, 'status')) count++;
    if (filterData(mockDPP.materials.complianceCerts, 'issuer', 'certType').length > 0) count++;
    return count;
  }, [activeTab, filterText, selectedSupplier, selectedType, selectedStatus, yarnSpinningMethodFilter, matchesFilter, filterData]);

  const [selectedCarbonStage, setSelectedCarbonStage] = useState<string | null>(null);
  const [selectedSubStage, setSelectedSubStage] = useState<string | null>(null);
  const [showFullCarbonReport, setShowFullCarbonReport] = useState(false);

  const currentCarbonData = selectedCarbonStage 
    ? mockCarbonData.find(s => s.stage === selectedCarbonStage)?.details?.map(d => ({ stage: d.name, emissions: d.value })) || []
    : mockCarbonData;

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-[#333]">
      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 px-8 py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-blue-900">纺织行业数字产品护照平台</h1>
              <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Textile Passport Digital Platform</p>
            </div>
          </div>

          <div className="flex gap-12 text-[11px] text-gray-500">
            <div>
              <p className="uppercase opacity-60">护照号码 / Passport ID:</p>
              <p className="font-mono font-bold text-gray-800 text-sm">{mockDPP.dppId}</p>
            </div>
            <div>
              <p className="uppercase opacity-60">产品类型 / Category:</p>
              <p className="font-bold text-gray-800 text-sm">桑蚕丝丝巾 / Silk Scarf</p>
            </div>
            <div>
              <p className="uppercase opacity-60">区块哈希 / Block Hash:</p>
              <p className="font-mono text-blue-600 truncate w-48 text-xs">{mockDPP.blockchainRecord}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-1 rounded">
                <img src="/qc.png" alt="QR Code" width={40} height={40} className="text-gray-800" />
              </div>
              <p className="mt-1 scale-75 whitespace-nowrap">扫描二维码体验 / Scan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          ))}
          </nav>

        <AnimatePresence mode="sync">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Product Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard 
                  label="成衣序列号 / Serial Number" 
                  value={mockDPP.materials.garmentManufacturing.garmentBatchId} 
                  subValue="GTIN-6901002233"
                />
                <InfoCard 
                  label="纤维体系 / Composition" 
                  value="100% 桑蚕丝 (Mulberry Silk)" 
                  subValue="GOTS Certified Fiber"
                />
                <InfoCard 
                  label="制造日期 / Manufacturing Date" 
                  value={mockDPP.materials.garmentManufacturing.manufacturingDate} 
                  subValue="Batch: 2026-03-15-A"
                />
              </div>

              {/* Manufacturer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ManufacturerCard 
                  title="成衣制造商 / Garment Producer"
                  name={mockDPP.materials.garmentManufacturing.factoryName}
                  country="中国/China"
                />
                <ManufacturerCard 
                  title="品牌商 / Brand Owner"
                  name={mockDPP.product.brandName}
                  country="中国/China"
                />
                <ManufacturerCard 
                  title="设计研发 / Design & R&D"
                  name="在宥创新实验室"
                  country="中国/China"
                />
              </div>

              {/* Technical Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Weight className="text-blue-500" />} label="产品重量 / Weight" value="180g ± 5g" />
                <StatCard icon={<Zap className="text-yellow-500" />} label="绿电占比 / Renewable Energy" value={`${mockDPP.materials.garmentManufacturing.renewableEnergyRatio}%`} />
                <StatCard icon={<Leaf className="text-green-500" />} label="回收潜力 / Recyclability" value="High (95%)" />
                <StatCard icon={<Database className="text-indigo-500" />} label="数据来源 / Data Source" value="Enterprise Verified" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<FileText className="text-gray-500" />} label="安全类别 / Safety Category" value={`GB 18401-${mockDPP.product.gb18401Category}`} />
                <StatCard icon={<Thermometer className="text-red-500" />} label="洗涤温度 / Wash Temp" value="≤ 40°C" />
                <StatCard icon={<Activity className="text-purple-500" />} label="预期寿命 / Expected Life" value="> 50 Washes" />
                <StatCard icon={<ShieldCheck className="text-emerald-500" />} label="合规状态 / Compliance" value="Verified" />
              </div>
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {mockCertificates.map((cert) => (
                <div 
                  key={cert.certId} 
                  onClick={() => setSelectedCert(cert)}
                  className="bg-white p-6 rounded-xl border border-blue-50 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pl-4 pb-4">
                    <ExternalLink size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{cert.certType} 认证证书</h3>
                        <p className="text-xs text-gray-400">{cert.certId}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-1 rounded font-bold">已验证 / VERIFIED</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">颁发机构 / Issuer:</span>
                      <span className="font-bold text-gray-700">{cert.issuer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">有效期 / Validity:</span>
                      <span className="text-gray-600">{cert.issueDate} 至 {cert.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">区块链哈希 / Hash:</span>
                      <span className="font-mono text-xs text-blue-600 truncate w-40">{cert.blockchainHash}</span>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <span className="text-xs font-bold text-blue-500 group-hover:underline flex items-center gap-1">
                        查看详情 / View Details <ChevronDown size={12} className="-rotate-90" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <AnimatePresence>
            {selectedCert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                >
                  <div className="bg-emerald-600 p-8 text-white relative">
                    <button 
                      onClick={() => setSelectedCert(null)}
                      className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <Settings size={24} className="rotate-45" />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                        <ShieldCheck size={40} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedCert.certType} 认证详情</h2>
                        <p className="opacity-80 font-mono text-sm">ID: {selectedCert.certId}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] uppercase font-bold opacity-60">状态 / Status</p>
                        <p className="text-sm font-bold">已验证 / VERIFIED</p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-[10px] uppercase font-bold opacity-60">区块链 / Blockchain</p>
                        <p className="text-sm font-bold">Ethereum Mainnet</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">颁发机构 / Issuer</p>
                        <p className="text-lg font-bold text-gray-800">{selectedCert.issuer}</p>
                        <p className="text-sm text-gray-500 mt-1">Global Certification Services Ltd.</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">有效期 / Validity Period</p>
                        <p className="text-lg font-bold text-gray-800">{selectedCert.issueDate} 至 {selectedCert.expiryDate}</p>
                        <p className="text-sm text-emerald-600 font-bold mt-1 flex items-center gap-1">
                          <CheckCircle2 size={14} /> 证书有效 / Active
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Database size={18} className="text-blue-500" />
                        <h3 className="font-bold text-gray-800">区块链存证信息 / Blockchain Proof</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">存证哈希 / Transaction Hash</p>
                          <div className="flex items-center gap-2">
                            <code className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs text-blue-600 font-mono flex-1 break-all">
                              {selectedCert.blockchainHash}
                            </code>
                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">区块高度 / Block Height</p>
                            <p className="text-sm font-bold text-gray-700">#19,452,108</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">存证时间 / Timestamp</p>
                            <p className="text-sm font-bold text-gray-700">{selectedCert.issueDate} 09:42:15 UTC</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-red-500" />
                          <h3 className="font-bold text-gray-800">审核报告 / Audit Reports</h3>
                        </div>
                        <span className="text-xs text-gray-400">PDF Document (2.4 MB)</span>
                      </div>
                      <div className="flex gap-4">
                        <a 
                          href={selectedCert.auditReport} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 bg-white border-2 border-gray-100 hover:border-emerald-500 p-4 rounded-2xl transition-all group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-red-50 p-2 rounded-xl text-red-500">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">年度合规审核报告</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Annual Compliance Report</p>
                            </div>
                          </div>
                          <ExternalLink size={18} className="text-gray-300 group-hover:text-emerald-500" />
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                        <Share2 size={18} /> 分享证书 / Share
                      </button>
                      <button 
                        onClick={() => setSelectedCert(null)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-colors"
                      >
                        关闭 / Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {activeTab === 'passport' && (
              <motion.div
                key="passport"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-30deg] select-none z-0">
                    <div className="text-[80px] md:text-[120px] font-bold text-blue-900 border-[10px] md:border-[20px] border-blue-900 px-10 rounded-[40px] md:rounded-[60px] uppercase whitespace-nowrap">
                      Digital Passport
                    </div>
                  </div>
                  {/* 护照头部 */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">数字产品护照</h1>
                        <p className="text-blue-100">Digital Product Passport</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-100">护照编号</p>
                        <p className="font-mono text-lg">{mockDPP.dppId}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 护照主体 */}
                  <div className="p-8">
                    {/* 产品图片和基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="relative z-10">
                        <img src="/dpp_product.png" alt="Product Image" className="w-full h-64 object-cover rounded-lg shadow-md" />
                      </div>
                      <div className="space-y-4 relative z-10">
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-bold">产品名称 / Product Name</p>
                          <p className="text-xl font-bold text-gray-800">{mockDPP.product.productName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-bold">品牌 / Brand</p>
                          <p className="text-lg font-semibold text-gray-800">{mockDPP.product.brandName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-bold">序列号 / Serial Number</p>
                          <p className="font-mono text-gray-800">{mockDPP.materials.garmentManufacturing.garmentBatchId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 uppercase font-bold">发行日期 / Issue Date</p>
                          <p className="text-gray-800">{mockDPP.issueDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 护照信息表格 */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">护照信息 / Passport Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">护照ID / Passport ID</span>
                            <span className="font-mono text-sm">{mockDPP.dppId}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">版本 / Version</span>
                            <span className="text-sm">{mockDPP.version}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">发行机构 / Issuer</span>
                            <span className="text-sm">{mockDPP.issuer}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">数据分类 / Classification</span>
                            <span className="text-sm">{mockDPP.dataClassification}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">区块链记录 / Blockchain</span>
                            <span className="font-mono text-xs">{mockDPP.blockchainRecord?.slice(0, 20)}...</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">数字链接 / Digital Link</span>
                            <span className="text-xs text-blue-600">{mockDPP.digitalLink}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 材料信息 */}
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">材料信息 / Material Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">材料成分</span>
                          <span className="font-semibold">{mockDPP.product.materialComposition.map(m => `${m.fiber} ${m.pct}%`).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 护照底部 */}
                    <div className="border-t pt-6 mt-6 text-center">
                      <p className="text-sm text-gray-500 mb-2">本数字护照由区块链技术保障，不可篡改</p>
                      <p className="text-xs text-gray-400">This digital passport is secured by blockchain technology</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'logistics' && (
              <motion.div
                key="logistics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <Truck size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">物流追踪 / Logistics Tracking</h3>
                      <p className="text-sm text-gray-400">运输单号 / Shipment ID: {mockLogistics.shipmentId}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                        {mockLogistics.status === 'In Transit' ? '运输中 / IN TRANSIT' : mockLogistics.status}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100 ml-[1px]" />

                    <div className="space-y-12 relative">
                      <TimelineItem 
                        icon={<Globe size={16} />} 
                        label="发货地 / Origin" 
                        value={mockLogistics.origin} 
                        active
                      />
                      <TimelineItem 
                        icon={<Truck size={16} />} 
                        label="承运商 / Carrier" 
                        value={mockLogistics.carrier} 
                        active
                      />
                      <TimelineItem 
                        icon={<Calendar size={16} />} 
                        label="预计送达 / Est. Delivery" 
                        value={mockLogistics.estimatedDelivery} 
                        active
                      />
                      <TimelineItem 
                        icon={<Home size={16} />} 
                        label="目的地 / Destination" 
                        value={mockLogistics.destination} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-600 p-6 rounded-2xl text-white">
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">当前位置 / Current Location</p>
                    <p className="text-lg font-bold">上海分拨中心 (Shanghai Distribution Center)</p>
                    <p className="text-xs opacity-80 mt-2">2026-03-24 14:00:00</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">运输方式 / Method</p>
                    <p className="text-lg font-bold text-gray-800">陆运 (Road Transport)</p>
                    <p className="text-xs text-blue-400 mt-2">低碳运输已启用 / Low Carbon Enabled</p>
                  </div>
                </div>
              </motion.div>
            )}

          <AnimatePresence>
            {showFullCarbonReport && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="bg-blue-600 p-8 text-white relative flex-shrink-0">
                    <button 
                      onClick={() => setShowFullCarbonReport(false)}
                      className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                        <Leaf size={40} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">全生命周期碳足迹报告</h2>
                        <p className="opacity-80 font-mono text-sm">Full Lifecycle Carbon Footprint Report</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 overflow-y-auto space-y-8">
                    {mockCarbonData.map((stage, sIdx) => (
                      <div key={sIdx} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center">{sIdx + 1}</span>
                            {stage.stage}
                          </h3>
                          <span className="text-blue-600 font-bold">{stage.emissions} {stage.unit}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                          {stage.details?.map((detail, dIdx) => (
                            <div key={dIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex justify-between items-center mb-3">
                                <p className="text-sm font-bold text-gray-700">{detail.name}</p>
                                <span className="text-xs font-bold text-emerald-600">{detail.value} {stage.unit}</span>
                              </div>
                              {detail.dataPoints && detail.dataPoints.length > 0 && (
                                <div className="space-y-2">
                                  {detail.dataPoints.map((point, pIdx) => (
                                    <div key={pIdx} className="flex justify-between text-[10px]">
                                      <span className="text-gray-400">{point.label}</span>
                                      <span className="font-medium text-gray-600">{point.value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">总计排放 / Total Lifecycle Emissions</p>
                        <p className="text-3xl font-bold text-blue-600">4.4 kg CO2e</p>
                      </div>
                      <button 
                        onClick={() => setShowFullCarbonReport(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
                      >
                        确认并返回 / Close
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">
                      * 数据基于 ISO 14067 标准核算，并已通过区块链存证。 / Data calculated based on ISO 14067 and verified on blockchain.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {activeTab === 'materials' && (
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <ProductionFlowchart />

              {/* Filter Bar */}
              <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Filter size={18} />
                    <h4 className="text-sm font-bold uppercase tracking-wider">数据筛选 / Data Filters</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    {isAnySectionVisible && (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">
                        匹配节点 / MATCHED NODES: {visibleSectionsCount}
                      </span>
                    )}
                    {!isAnySectionVisible && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded animate-pulse">
                        未找到匹配项 / NO MATCHES
                      </span>
                    )}
                    <button 
                      onClick={() => {
                        setFilterText('');
                        setSelectedSupplier('ALL');
                        setSelectedType('ALL');
                        setSelectedStatus('ALL');
                        setYarnSpinningMethodFilter('ALL');
                      }}
                      className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Clock size={12} /> 重置筛选 / RESET
                    </button>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">关键词 / Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="搜索..." 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">供应商 / Supplier</label>
                    <div className="relative">
                      <select 
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      >
                        <option value="ALL">所有供应商 / All</option>
                        {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">类型 / Type</label>
                    <div className="relative">
                      <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      >
                        <option value="ALL">所有类型 / All</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">状态 / Status</label>
                    <div className="relative">
                      <select 
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      >
                        <option value="ALL">所有状态 / All</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3 bg-white rounded-2xl border border-blue-50 shadow-sm text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span className="text-gray-500 border-r border-gray-100 pr-6">数据来源图例 / Source Legend:</span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                  <span className="text-gray-600">企业 ERP / Enterprise</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></div>
                  <span className="text-gray-600">第三方证书 / Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
                  <span className="text-gray-600">模型估算 / Model Est.</span>
                </div>
              </div>

              {!isAnySectionVisible && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white py-20 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400"
                >
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-bold">未找到符合筛选条件的数据</p>
                  <p className="text-sm">No matching data found for your current filters.</p>
                  <button 
                    onClick={() => {
                      setFilterText('');
                      setSelectedSupplier('ALL');
                      setSelectedType('ALL');
                      setSelectedStatus('ALL');
                      setYarnSpinningMethodFilter('ALL');
                    }}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    清除所有筛选 / Clear All Filters
                  </button>
                </motion.div>
              )}

              {/* 1. Product Master */}
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">1. 产品主数据 / Product Master</h3>
                  </div>
                  <DataBadge 
                    classification={mockDPP.product.dataClassification} 
                    source={mockDPP.product.sourceType} 
                    index={mockDPP.product.id} 
                    hash={mockDPP.product.blockchainHash} 
                    createdAt={mockDPP.product.createdAt}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <DetailItem label="产品名称 / Product Name" value={mockDPP.product.productName} />
                    <DetailItem label="品牌 / Brand" value={mockDPP.product.brandName} />
                    <DetailItem label="SKU" value={mockDPP.product.sku} />
                  </div>
                  <div className="space-y-4">
                    <DetailItem label="安全类别 / Category" value={mockDPP.product.gb18401Category} />
                    <DetailItem label="包装 / Packaging" value={mockDPP.product.packaging} />
                    <div className="flex gap-2 mt-2">
                      {mockDPP.product.availableColors?.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} title={c.name} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 原材料供应 / Fiber Batch Node */}
              {matchesFilter({ ...mockDPP.materials.fiberOrigin[0], ...mockDPP.materials.materialBatch[0] }, 'supplierName', 'fiberType') && (
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Database size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">2. 原材料供应 / Fiber Batch Node</h3>
                  </div>
                  <DataBadge 
                    classification={mockDPP.materials.fiberOrigin[0].dataClassification} 
                    source={mockDPP.materials.fiberOrigin[0].sourceType} 
                    index={mockDPP.materials.fiberOrigin[0].id} 
                    hash={mockDPP.materials.fiberOrigin[0].blockchainHash} 
                    createdAt={mockDPP.materials.fiberOrigin[0].createdAt}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">纤维溯源 / Fiber Origin</h4>
                    <div className="space-y-3">
                      <DetailItem label="纤维类型 / Fiber Type" value={mockDPP.materials.fiberOrigin[0].fiberType} />
                      <DetailItem label="产地国家 / Origin Country" value={mockDPP.materials.fiberOrigin[0].originCountry} />
                      <DetailItem label="农场位置 / Farm Location" value={mockDPP.materials.fiberOrigin[0].farmLocation} />
                      <DetailItem label="收获日期 / Harvest Date" value={mockDPP.materials.fiberOrigin[0].harvestDate} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">批次详情 / Batch Details</h4>
                    <div className="space-y-3">
                      <DetailItem label="批次号 / Batch ID" value={mockDPP.materials.materialBatch[0].batchId} />
                      <DetailItem label="供应商 / Supplier" value={mockDPP.materials.materialBatch[0].supplierName} />
                      <DetailItem label="重量 / Weight" value={`${mockDPP.materials.materialBatch[0].weight} ${mockDPP.materials.materialBatch[0].unit}`} />
                      <DetailItem label="到货日期 / Arrival Date" value={mockDPP.materials.materialBatch[0].arrivalDate} />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* 3. 纱线加工 / Yarn Batch Node */}
              <TableCard 
                title="3. 纱线加工 / Yarn Batch Node" 
                data={filterData(mockDPP.materials.yarnSpinning, 'factoryName', 'spinningMethod').filter(y => yarnSpinningMethodFilter === 'ALL' || y.spinningMethod === yarnSpinningMethodFilter)} 
                columns={[
                  { label: '纱线ID / Yarn ID', key: 'yarnId' },
                  { label: '纺纱工艺 / Method', key: 'spinningMethod' },
                  { label: '支数 / Count', key: 'yarnCount' },
                  { label: '工厂 / Factory', key: 'factoryName' }
                ]}
                headerActions={
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">纺纱工艺 / Method</label>
                    <div className="relative">
                      <select 
                        value={yarnSpinningMethodFilter}
                        onChange={(e) => setYarnSpinningMethodFilter(e.target.value)}
                        className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                      >
                        <option value="ALL">所有工艺 / All</option>
                        {yarnSpinningMethods.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                    </div>
                  </div>
                }
              />

              {/* 4. 面料织造 / Fabric Batch Node */}
              <TableCard 
                title="4. 面料织造 / Fabric Batch Node" 
                data={filterData(mockDPP.materials.fabricWeaving, 'factoryName', 'weaveType')} 
                columns={[
                  { label: '面料ID / Fabric ID', key: 'fabricId' },
                  { label: '织造工艺 / Weave', key: 'weaveType' },
                  { label: '克重/密度 / Density', key: 'density' },
                  { label: '工厂 / Factory', key: 'factoryName' }
                ]}
              />

              {/* 5. 染色整理 / Dyeing Batch Node */}
              <TableCard 
                title="5. 染色整理 / Dyeing Batch Node" 
                data={filterData(mockDPP.materials.dyeingFinishing, 'factoryName', 'dyeType')} 
                columns={[
                  { label: '工艺ID / Process ID', key: 'processId' },
                  { label: '染料类型 / Dye', key: 'dyeType' },
                  { label: '后整理 / Finishing', key: 'finishingMethod' },
                  { label: '工厂 / Factory', key: 'factoryName' }
                ]}
              />

              {/* 6. 辅料节点 / Accessories Batch Node */}
              <TableCard 
                title="6. 辅料节点 / Accessories Batch Node" 
                data={filterData(mockDPP.materials.accessoriesBatch, 'accessorySupplier', 'color', 'size')} 
                columns={[
                  { label: '辅料批次 / Batch ID', key: 'accessoryBatchId' },
                  { label: '供应商 / Supplier', key: 'accessorySupplier' },
                  { label: '颜色 / Color', key: 'color' },
                  { label: '尺寸 / Size', key: 'size' },
                  { label: '成分 / Composition', key: (d) => d.materialComposition?.map(c => `${c.fiber} ${c.pct}%`).join(', ') || '-' }
                ]}
              />

              {/* 7. 质量控制 / Quality Control Node */}
              <TableCard 
                title="7. 质量控制 / Quality Control Node" 
                data={filterData(mockDPP.materials.qualityControl, 'inspector', 'testItem', 'result')} 
                columns={[
                  { label: '报告ID / Report ID', key: 'reportId' },
                  { label: '检测项目 / Test Item', key: 'testItem' },
                  { label: '检测结果 / Result', key: (d) => (
                    <span className={`font-bold ${d.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                      {d.result === 'PASS' ? <CheckCircle2 size={16} className="inline mr-1" /> : <AlertCircle size={16} className="inline mr-1" />}
                      {d.result}
                    </span>
                  )},
                  { label: '检测员 / Inspector', key: 'inspector' }
                ]}
              />

              {/* 8. 包装标识 / Packaging & Labeling */}
              {matchesFilter(mockDPP.materials.packagingLabeling, undefined, 'materialType') && (
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Layers size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">8. 包装标识 / Packaging & Labeling</h3>
                  </div>
                  <DataBadge 
                    classification={mockDPP.materials.packagingLabeling.dataClassification} 
                    source={mockDPP.materials.packagingLabeling.sourceType} 
                    index={mockDPP.materials.packagingLabeling.id} 
                    hash={mockDPP.materials.packagingLabeling.blockchainHash}
                    createdAt={mockDPP.materials.packagingLabeling.createdAt}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="包装ID / Packaging ID" value={mockDPP.materials.packagingLabeling.packagingId} />
                  <DetailItem label="材料类型 / Material" value={mockDPP.materials.packagingLabeling.materialType} />
                  <DetailItem label="标签类型 / Label" value={mockDPP.materials.packagingLabeling.labelType} />
                  <DetailItem label="回收信息 / Recycling" value={mockDPP.materials.packagingLabeling.recyclingInfo} />
                </div>
              </div>
              )}

              {/* 9. 成衣制造 / Garment Batch Node */}
              {matchesFilter(mockDPP.materials.garmentManufacturing, 'factoryName') && (
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Zap size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">9. 成衣制造 / Garment Batch Node</h3>
                  </div>
                  <DataBadge 
                    classification={mockDPP.materials.garmentManufacturing.dataClassification} 
                    source={mockDPP.materials.garmentManufacturing.sourceType} 
                    index={mockDPP.materials.garmentManufacturing.id} 
                    hash={mockDPP.materials.garmentManufacturing.blockchainHash}
                    createdAt={mockDPP.materials.garmentManufacturing.createdAt}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="成衣批次 / Batch ID" value={mockDPP.materials.garmentManufacturing.garmentBatchId} />
                  <DetailItem label="工厂名称 / Factory" value={mockDPP.materials.garmentManufacturing.factoryName} />
                  <DetailItem label="生产日期 / Mfg Date" value={mockDPP.materials.garmentManufacturing.manufacturingDate} />
                  <DetailItem label="绿电比例 / Renewable" value={`${mockDPP.materials.garmentManufacturing.renewableEnergyRatio}%`} />
                </div>
              </div>
              )}

              {/* 10. 物流节点 / Logistics Node */}
              {matchesFilter(mockDPP.logistics, 'carrier', undefined, 'status') && (
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Truck size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">10. 物流节点 / Logistics Node</h3>
                  </div>
                  <DataBadge 
                    classification={mockDPP.logistics.dataClassification} 
                    source={mockDPP.logistics.sourceType} 
                    index={mockDPP.logistics.id} 
                    hash={mockDPP.logistics.blockchainHash} 
                    createdAt={mockDPP.logistics.createdAt}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="运单号 / Shipment ID" value={mockDPP.logistics.shipmentId} />
                  <DetailItem label="始发地 / Origin" value={mockDPP.logistics.origin} />
                  <DetailItem label="目的地 / Destination" value={mockDPP.logistics.destination} />
                  <DetailItem label="承运商 / Carrier" value={mockDPP.logistics.carrier} />
                  <DetailItem label="预计送达 / Est. Delivery" value={mockDPP.logistics.estimatedDelivery} />
                  <DetailItem label="状态 / Status" value={mockDPP.logistics.status} />
                </div>
              </div>
              )}

              {/* 11. 护照实例 / DPP Instance */}
              {matchesFilter(mockDPP, 'issuer', undefined, 'status') && (
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">11. 护照实例 / DPP Instance</h3>
                  </div>
                  <DataBadge 
                    classification={mockDPP.dataClassification} 
                    source={mockDPP.sourceType} 
                    index={mockDPP.id} 
                    hash={mockDPP.blockchainHash} 
                    createdAt={mockDPP.createdAt}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="护照ID / Passport ID" value={mockDPP.passportId} />
                  <DetailItem label="版本 / Version" value={mockDPP.version} />
                  <DetailItem label="发行日期 / Issue Date" value={mockDPP.issueDate} />
                  <DetailItem label="发行机构 / Issuer" value={mockDPP.issuer} />
                </div>
              </div>
              )}

              {/* 12. 合规凭证 / Compliance Cert Asset */}
              <TableCard 
                title="12. 合规凭证 / Compliance Cert Asset" 
                data={filterData(mockDPP.materials.complianceCerts, 'issuer', 'certType')} 
                columns={[
                  { label: '证书ID / Cert ID', key: 'certId' },
                  { label: '证书类型 / Type', key: 'certType' },
                  { label: '颁发机构 / Issuer', key: 'issuer' },
                  { label: '有效期至 / Expiry', key: 'expiryDate' }
                ]}
              />
            </motion.div>
          )}

          {activeTab === 'carbon' && (
            <motion.div
              key="carbon"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Leaf size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                          {(selectedCarbonStage || selectedSubStage) && (
                            <button 
                              onClick={() => {
                                if (selectedSubStage) {
                                  setSelectedSubStage(null);
                                } else {
                                  setSelectedCarbonStage(null);
                                }
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-blue-600"
                            >
                              <ArrowLeft size={16} />
                            </button>
                          )}
                        <h3 className="text-lg font-bold text-gray-800">
                          {selectedSubStage 
                            ? `数据点: ${selectedSubStage}` 
                            : selectedCarbonStage 
                              ? `明细: ${selectedCarbonStage}` 
                              : '碳足迹分析 / Carbon Footprint Analysis'}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400">
                        {selectedSubStage
                          ? '具体排放数据点 / Specific Data Points'
                          : selectedCarbonStage 
                            ? '各子阶段排放贡献 / Detailed Emissions' 
                            : '生命周期阶段排放分布 (点击柱状图下钻) / Emissions by Lifecycle Stage (Click to drill down)'}
                      </p>
                    </div>
                  </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setShowFullCarbonReport(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                      >
                        <FileText size={14} /> 完整报告 / Full Report
                      </button>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedSubStage
                            ? `${mockCarbonData.find(s => s.stage === selectedCarbonStage)?.details?.find(d => d.name === selectedSubStage)?.value} kg CO2e`
                            : selectedCarbonStage 
                              ? `${mockCarbonData.find(s => s.stage === selectedCarbonStage)?.emissions} kg CO2e`
                              : '4.4 kg CO2e'}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-gray-400">
                          {selectedSubStage ? '子阶段排放 / Sub-stage Total' : selectedCarbonStage ? '阶段排放 / Stage Total' : '总排放量 / Total Emissions'}
                        </p>
                      </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={currentCarbonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      onClick={(data) => {
                        if (!selectedCarbonStage && data && data.activeLabel) {
                          setSelectedCarbonStage(data.activeLabel);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="stage" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#999' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#999' }}
                        label={{ value: 'kg CO2e', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#999' }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-100 rounded-xl shadow-xl">
                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                                  {selectedCarbonStage ? '子阶段 / Sub-stage' : '生命周期阶段 / Lifecycle Stage'}
                                </p>
                                <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${selectedCarbonStage ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                                  <p className="text-xs font-medium text-gray-600">
                                    排放量: <span className={`${selectedCarbonStage ? 'text-emerald-600' : 'text-blue-600'} font-bold`}>{payload[0].value} kg CO2e</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px' }}
                        formatter={() => <span className="text-gray-400 uppercase">排放分布 / Emissions Distribution</span>}
                      />
                      <Bar 
                        dataKey="emissions" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                        className={!selectedCarbonStage ? 'cursor-pointer' : ''}
                      >
                        <LabelList 
                          dataKey="emissions" 
                          position="top" 
                          formatter={(v: number) => `${v}`}
                          style={{ fontSize: '10px', fontWeight: 'bold', fill: '#666' }} 
                        />
                        {currentCarbonData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={selectedCarbonStage ? '#10b981' : (index === 1 ? '#2563eb' : '#94a3b8')} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">主要排放源 / Primary Source</p>
                    <p className="text-sm font-bold text-blue-900">生产制造 (Manufacturing)</p>
                    <p className="text-xs text-blue-600 mt-1">占比 56.8% / 56.8% of total</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">核算标准 / Standard</p>
                    <p className="text-sm font-bold text-gray-800">ISO 14067:2018</p>
                    <p className="text-xs text-gray-500 mt-1">第三方机构核证 / Verified</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] uppercase font-bold text-emerald-400 mb-1">累计减排 / Total Savings</p>
                    <p className="text-sm font-bold text-emerald-900">1.02 kg CO2e</p>
                    <p className="text-xs text-emerald-600 mt-1">已通过区块链核验 / Verified</p>
                  </div>
                </div>

                {/* Lifecycle Stage Details Section */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <List size={18} className="text-blue-500" />
                      <h4 className="text-md font-bold text-gray-800">
                        {selectedSubStage ? '数据点明细 / Data Point Details' : '生命周期阶段明细 / Lifecycle Stage Details'}
                      </h4>
                    </div>
                    {(selectedCarbonStage || selectedSubStage) && (
                      <button 
                        onClick={() => {
                          if (selectedSubStage) {
                            setSelectedSubStage(null);
                          } else {
                            setSelectedCarbonStage(null);
                          }
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        <ArrowLeft size={12} /> {selectedSubStage ? '返回明细 / Back to Details' : '返回概览 / Back to Overview'}
                      </button>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                        <tr>
                          <th className="px-6 py-3">{selectedSubStage ? '数据点 / Data Point' : '阶段 / Stage'}</th>
                          <th className="px-6 py-3">{selectedSubStage ? '数值 / Value' : '排放量 / Emissions'}</th>
                          <th className="px-6 py-3 text-right">操作 / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedSubStage ? (
                          // Show data points for selected sub-stage
                          mockCarbonData.find(s => s.stage === selectedCarbonStage)?.details?.find(d => d.name === selectedSubStage)?.dataPoints?.map((point, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-700">{point.label}</td>
                              <td className="px-6 py-4 text-emerald-600 font-bold">{point.value}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">技术数据 / Tech Data</span>
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                                暂无详细数据点 / No detailed data points available
                              </td>
                            </tr>
                          )
                        ) : selectedCarbonStage ? (
                          // Show sub-stages for selected stage
                          mockCarbonData.find(s => s.stage === selectedCarbonStage)?.details?.map((detail, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-700">{detail.name}</td>
                              <td className="px-6 py-4 text-emerald-600 font-bold">{detail.value} kg CO2e</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => setSelectedSubStage(detail.name)}
                                  className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                  查看数据点 / View Data Points
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          // Show all main stages
                          mockCarbonData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-700">{item.stage}</td>
                              <td className="px-6 py-4 text-blue-600 font-bold">{item.emissions} kg CO2e</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => setSelectedCarbonStage(item.stage)}
                                  className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all"
                                >
                                  查看明细 / View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detailed Savings Initiatives */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap size={18} className="text-emerald-500" />
                    <h4 className="text-md font-bold text-gray-800">减排举措明细 / Carbon Reduction Initiatives</h4>
                  </div>
                  <div className="space-y-4">
                    {mockCarbonSavings.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Leaf size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{item.initiative}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">-{item.saving} {item.unit}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">减排量 / Saved</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Usage Status Card */}
                <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Activity size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">使用状态 / Usage Status</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500">当前状态 / Current Status</span>
                      <span className="text-sm font-bold text-blue-600">{mockDPP.usage.currentStatus}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500">最后维护 / Last Maintenance</span>
                      <span className="text-sm font-bold text-gray-800">{mockDPP.usage.lastMaintenance}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500">预计剩余寿命 / Est. Remaining Life</span>
                      <span className="text-sm font-bold text-gray-800">{mockDPP.usage.estimatedLifeMonths} 个月 / Months</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500">使用次数 / Usage Count</span>
                      <span className="text-sm font-bold text-gray-800">{mockDPP.usage.usageCount} 次 / Times</span>
                    </div>
                  </div>
                </div>

                {/* End of Life Options Card */}
                <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                      <Recycle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">回收与处置 / End of Life</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-[10px] uppercase font-bold text-green-400 mb-1">回收说明 / Recycling Instructions</p>
                      <p className="text-sm text-green-800 leading-relaxed">{mockDPP.endOfLife.recyclingInstructions}</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-blue-400 mb-2">二手转让平台 / Resale Platforms</p>
                      <div className="flex gap-2">
                        {mockDPP.endOfLife.resalePlatforms.map((platform, idx) => (
                          <a key={idx} href={platform.url} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-colors">
                            {platform.name}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart size={14} className="text-emerald-500" />
                        <p className="text-[10px] uppercase font-bold text-emerald-400">品牌回收计划 / Take-back Program</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-800">{mockDPP.endOfLife.takeBackProgram}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance History / Blockchain Log */}
              <div className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">运营日志 / Operating Log (Blockchain)</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">产品激活 / Product Activated</p>
                      <p className="text-[10px] text-gray-400">2026-03-18 14:20:05</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">0x7a2...f31</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">维护保养 / Maintenance Recorded</p>
                      <p className="text-[10px] text-gray-400">2026-03-20 09:15:33</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">0x4b1...e92</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab !== 'basic' && activeTab !== 'compliance' && activeTab !== 'logistics' && activeTab !== 'materials' && activeTab !== 'carbon' && activeTab !== 'status' && activeTab !== 'passport' && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <Settings size={48} className="animate-spin-slow mb-4 opacity-20" />
              <p className="text-lg font-medium">模块开发中 / Coming Soon</p>
              <p className="text-sm">该部分数据正在同步至区块链网络...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-blue-100 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
          模拟数据仅供展示 / ONLY FOR DISPLAY
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 group">
          <Home size={24} />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            首页 / HOME
          </span>
        </button>
      </div>
    </div>
  );
}

function InfoCard({ label, value, subValue }: { label: string; value: string; subValue: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-blue-50 shadow-sm">
      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800 break-all">{value}</p>
      <p className="text-[10px] text-blue-400 font-mono mt-1">{subValue}</p>
    </div>
  );
}

function ManufacturerCard({ title, name, country }: { title: string; name: string; country: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-blue-50 shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 mb-3">{title}</p>
        <p className="text-sm font-bold text-gray-700 leading-tight">{name}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase">产地 / Country</span>
          <span className="text-xs font-bold text-gray-600">{country}</span>
        </div>
        <div className="w-8 h-5 bg-red-600 relative flex items-center justify-center overflow-hidden rounded-sm">
          <div className="absolute text-[10px] text-yellow-400" style={{ left: '2px', top: '1px' }}>★</div>
          <div className="absolute text-[3px] text-yellow-400" style={{ left: '6px', top: '0px' }}>★</div>
          <div className="absolute text-[3px] text-yellow-400" style={{ left: '7px', top: '2px' }}>★</div>
          <div className="absolute text-[3px] text-yellow-400" style={{ left: '7px', top: '4px' }}>★</div>
          <div className="absolute text-[3px] text-yellow-400" style={{ left: '6px', top: '6px' }}>★</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm flex items-center gap-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({ icon, label, value, active = false }: { icon: React.ReactNode; label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-6 group">
      <div className={`z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
        active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-gray-100 text-gray-300'
      }`}>
        {icon}
      </div>
      <div className="pt-1">
        <p className={`text-[10px] uppercase font-bold transition-colors ${active ? 'text-blue-400' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-sm font-bold transition-colors ${active ? 'text-gray-800' : 'text-gray-400'}`}>{value}</p>
      </div>
    </div>
  );
}
