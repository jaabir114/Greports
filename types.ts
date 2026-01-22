
export enum Language {
  ARABIC = 'ar',
  SOMALI = 'so',
  ENGLISH = 'en'
}

export enum ReportType {
  FORMAL = 'Formal Report',
  LETTER = 'Official Letter',
  TECHNICAL = 'Technical Document',
  MINUTES = 'Meeting Minutes',
  PROPOSAL = 'Project Proposal'
}

export const ReportTypeTranslations: Record<Language, Record<ReportType, string>> = {
  [Language.ARABIC]: {
    [ReportType.FORMAL]: 'تقرير رسمي',
    [ReportType.LETTER]: 'خطاب رسمي إداري',
    [ReportType.TECHNICAL]: 'وثيقة فنية تخصصية',
    [ReportType.MINUTES]: 'محضر اجتماع رسمي',
    [ReportType.PROPOSAL]: 'مقترح مشروع متكامل'
  },
  [Language.SOMALI]: {
    [ReportType.FORMAL]: 'Warbixin Rasmi ah',
    [ReportType.LETTER]: 'Warqad Maamul',
    [ReportType.TECHNICAL]: 'Dukumenti Farsamo',
    // Fixed: Corrected the report type key to ReportType.MINUTES and removed invalid Language reference
    [ReportType.MINUTES]: 'Hab-maamuus Shir',
    [ReportType.PROPOSAL]: 'Xaalad Mashruuc'
  },
  [Language.ENGLISH]: {
    [ReportType.FORMAL]: 'Formal Executive Report',
    [ReportType.LETTER]: 'Official Business Letter',
    [ReportType.TECHNICAL]: 'Technical Specification',
    [ReportType.MINUTES]: 'Minutes of Meeting',
    [ReportType.PROPOSAL]: 'Project Proposal'
  }
};

export interface Report {
  id: string;
  title: string;
  content: string;
  type: ReportType;
  recipient: string;
  senderName: string;
  language: Language;
  logoUrl?: string;
  createdAt: number;
}

export interface ReportConfig {
  type: ReportType;
  recipient: string;
  senderName: string;
  language: Language;
  logoUrl?: string;
  topic: string;
  details: string;
}
