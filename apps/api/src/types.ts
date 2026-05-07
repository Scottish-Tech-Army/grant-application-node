export type FieldType = "text" | "textarea" | "number" | "url";

export interface CommonField {
  id: string;
  key: string;
  label: string;
  group: string;
  type: FieldType;
  helpText: string;
  createdAt: string;
}

export interface FieldVersion {
  id: string;
  fieldId: string;
  version: number;
  value: string;
  createdAt: string;
}

export interface ApplicationSpecificFieldVersion {
  id: string;
  version: number;
  value: string;
  createdAt: string;
}

export interface ApplicationSpecificField {
  id: string;
  label: string;
  type: FieldType;
  versions: ApplicationSpecificFieldVersion[];
}

export interface ApplicationSelectedCommon {
  fieldId: string;
  versionId: string;
}

export interface Application {
  id: string;
  name: string;
  funder: string;
  status: "draft" | "submitted";
  createdAt: string;
  selectedCommon: ApplicationSelectedCommon[];
  specificFields: ApplicationSpecificField[];
}

export interface DbModel {
  meta: { id: string; createdAt: string };
  commonFields: CommonField[];
  fieldVersions: FieldVersion[];
  applications: Application[];
}
