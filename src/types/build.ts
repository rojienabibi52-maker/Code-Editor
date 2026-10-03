export type BuildVariant = 'debug' | 'release';
export type BuildOutputType = 'apk' | 'aab';
export type BuildStatus = 'idle' | 'prechecking' | 'building' | 'successful' | 'failed';

export type BuildStage =
  | 'idle'
  | 'precheck'
  | 'dependencies'
  | 'compilation'
  | 'resources'
  | 'manifest'
  | 'packaging'
  | 'signing'
  | 'validation'
  | 'complete'
  | 'failed';

export interface SigningConfiguration {
  id: string;
  name: string;
  storeFile: string;
  storePassword?: string;
  keyAlias: string;
  keyPassword?: string;
  v1SigningEnabled: boolean;
  v2SigningEnabled: boolean;
}

export interface ToolchainConfiguration {
  jdkVersion: string;
  gradleVersion: string;
  androidGradlePlugin: string;
  compileSdkVersion: number;
  minSdkVersion: number;
  targetSdkVersion: number;
  buildToolsVersion: string;
  ndkVersion: string;
  kotlinVersion: string;
  architectureStatus: string;
}

export interface BuildLogItem {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  tag: string;
  message: string;
  detail?: string;
}

export interface OutputValidationResult {
  passed: boolean;
  artifactExists: boolean;
  packageVerified: boolean;
  versionVerified: boolean;
  integrityVerified: boolean;
  fileSizeBytes: number;
  checksumSha256: string;
  notes: string[];
}

export interface BuildOutputItem {
  id: string;
  variant: BuildVariant;
  type: BuildOutputType;
  fileName: string;
  fileSizeText: string;
  fileSizeBytes: number;
  path: string;
  checksumSha256: string;
  timestamp: number;
  buildDurationMs?: number;
  versionCode: number;
  versionName: string;
  downloadDataUrl?: string;
  validation?: OutputValidationResult;
}

export interface PreCheckItem {
  id: string;
  category: 'structure' | 'package' | 'manifest' | 'source' | 'resources' | 'assets' | 'dependencies' | 'sdk' | 'signing';
  title: string;
  passed: boolean;
  message: string;
  critical: boolean;
  fixAction?: string;
  fileId?: string;
}

export interface PreCheckResult {
  valid: boolean;
  canBypass: boolean;
  checks: PreCheckItem[];
  errorCount: number;
  warningCount: number;
}

export interface BuildFailureDetails {
  stage: BuildStage;
  error: string;
  file?: string;
  line?: number;
  log?: string;
  suggestedFix?: string;
}

export interface BuildConfiguration {
  projectId: string;
  applicationId: string;
  versionCode: number;
  versionName: string;
  activeVariant: BuildVariant;
  outputTarget: BuildOutputType;
  minifyEnabled: boolean;
  shrinkResources: boolean;
  signing: SigningConfiguration;
  toolchain: ToolchainConfiguration;
  logs: BuildLogItem[];
  history: BuildOutputItem[];
  status: BuildStatus;
}
