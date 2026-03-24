/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DataClassification = 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL';
export type SourceType = 'ENTERPRISE' | 'CERTIFICATE' | 'MODEL_EST';

export interface BaseObject {
  id: string; // Physical Index / ID
  createdAt: string;
  dataClassification: DataClassification;
  sourceType: SourceType;
  blockchainHash?: string;
}

// 1. Product Master (产品主表)
export interface ProductMaster extends BaseObject {
  productId: string;
  sku: string;
  productName: string;
  brandName: string;
  materialComposition: { fiber: string; pct: number }[];
  packaging: string;
  gb18401Category: 'A' | 'B' | 'C';
  careLabelSymbols: string[];
  availableColors?: { name: string; hex: string }[];
}

// 2. Fiber Origin (纤维产地)
export interface FiberOrigin extends BaseObject {
  fiberType: string;
  originCountry: string;
  farmLocation: string;
  harvestDate: string;
  certificationId: string;
}

// 3. Material Batch (原材料批次)
export interface MaterialBatch extends BaseObject {
  batchId: string;
  materialName: string;
  weight: number;
  unit: string;
  supplierName: string;
  arrivalDate: string;
}

// 4. Yarn Spinning (纺纱加工)
export interface YarnSpinning extends BaseObject {
  yarnId: string;
  spinningMethod: string;
  yarnCount: string;
  factoryName: string;
  productionDate: string;
}

// 5. Fabric Weaving (面料织造)
export interface FabricWeaving extends BaseObject {
  fabricId: string;
  weaveType: string;
  density: string;
  factoryName: string;
  weavingDate: string;
}

// 6. Dyeing & Finishing (染色整理)
export interface DyeingFinishing extends BaseObject {
  processId: string;
  dyeType: string;
  finishingMethod: string;
  factoryName: string;
  completionDate: string;
}

// 7. Garment Manufacturing (成衣制造)
export interface GarmentManufacturing extends BaseObject {
  garmentBatchId: string;
  factoryName: string;
  manufacturingDate: string;
  renewableEnergyRatio: number;
  countryOfProduction: string;
}

// 8. Quality Control (质量检测)
export interface QualityControl extends BaseObject {
  reportId: string;
  testItem: string;
  result: 'PASS' | 'FAIL';
  inspector: string;
  testDate: string;
}

// 9. Compliance Certs (合规证书)
export interface ComplianceCert extends BaseObject {
  certId: string;
  certType: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  auditReport: string;
}

// 10. Packaging & Labeling (包装与标签)
export interface PackagingLabeling extends BaseObject {
  packagingId: string;
  materialType: string;
  labelType: string;
  recyclingInfo: string;
}

// 11. Accessories Batch (辅料节点)
export interface AccessoriesBatch extends BaseObject {
  accessoryBatchId: string;
  accessorySupplier: string;
  color?: string;
  size?: string;
  materialComposition?: { fiber: string; pct: number }[];
}

export interface DPPInstance extends BaseObject {
  dppId: string;
  passportId: string;
  version: string;
  issueDate: string;
  issuer: string;
  blockchainRecord: string;
  digitalLink: string;
  product: ProductMaster;
  materials: {
    fiberOrigin: FiberOrigin[];
    materialBatch: MaterialBatch[];
    yarnSpinning: YarnSpinning[];
    fabricWeaving: FabricWeaving[];
    dyeingFinishing: DyeingFinishing[];
    garmentManufacturing: GarmentManufacturing;
    qualityControl: QualityControl[];
    complianceCerts: ComplianceCert[];
    packagingLabeling: PackagingLabeling;
    accessoriesBatch: AccessoriesBatch[];
  };
  logistics: LogisticsNode;
  status: 'Original' | 'Recycled' | 'Repaired';
  usage: {
    currentStatus: string;
    lastMaintenance?: string;
    estimatedLifeMonths: number;
    usageCount?: number;
  };
  endOfLife: {
    recyclingInstructions: string;
    resalePlatforms: { name: string; url: string }[];
    takeBackProgram: string;
  };
}

export interface LogisticsNode extends BaseObject {
  shipmentId: string;
  origin: string;
  destination: string;
  carrier: string;
  estimatedDelivery: string;
  status: 'In Transit' | 'Delivered' | 'Pending';
}
