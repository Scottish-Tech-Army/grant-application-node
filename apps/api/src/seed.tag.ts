import { nanoid } from "nanoid";
import { now, slugKey } from "./util.js";
import type { CommonField, FieldVersion } from "./types.js";

// TAG-inspired seed: 13 groups of common questions (usable as reusable fields)
export function buildTagSeed(): { commonFields: CommonField[]; fieldVersions: FieldVersion[] } {
  const groups: Array<{ group: string; fields: string[] }> = [
    {
      group: "Organizational Biographical and General Information",
      fields: [
        "Applicant contact information",
        "Organization contact information",
        "Organization legal status",
        "Organization founding date and history",
        "Organization social media links",
        "Staff qualifications",
        "Staff demographics",
        "Total number of part-time workers",
        "Total number of full-time workers",
        "Total number of paid staff",
        "Total staff hours",
        "Professional references or testimonials",
        "Key program staff resumes or CVs",
        "Organization donation website",
        "Organization DUNS number or GuideStar profile",
        "Organization fax number"
      ]
    },
    {
      group: "Miscellaneous",
      fields: [
        "Authorized signature and acknowledgement of eligibility criteria",
        "Disclosure of involvement with supporting organizations"
      ]
    },
    {
      group: "Corporate Delegation and Oversight, Organizational Structure",
      fields: [
        "Board and CEO contact information",
        "Board and CEO demographics",
        "Board compensation details",
        "Board financial contribution practices",
        "Qualitative board or CEO characteristics",
        "Total number of board members",
        "Total number of executive staff",
        "Strategies for continual organizational improvement"
      ]
    },
    {
      group: "Data Handling, Measurement, Evaluation and Reporting",
      fields: [
        "Description of data collected or generated",
        "Outcomes, deliverables and evaluation criteria",
        "Data collected to monitor progress or impact",
        "Data security and monitoring policies",
        "Data sharing permissions",
        "Data collection frequency and sources",
        "Volunteer hours calculation methodology",
        "Population served calculation methodology",
        "Measurement theory or framework",
        "Institutional review board approval status",
        "School-related data metrics"
      ]
    },
    {
      group: "Project Demographics, Orientation and Status",
      fields: [
        "Annual population served counts",
        "Race and ethnicity of populations served",
        "Geographic distribution of populations served",
        "Income or socioeconomic status of populations served",
        "Occupational status of populations served",
        "Gender identity of populations served",
        "Sexual orientation of populations served",
        "Disability status of populations served",
        "Veteran status of populations served",
        "Age groups served"
      ]
    },
    { group: "Alternative Supports", fields: ["Non-financial resources or partnerships supporting the work"] },
    { group: "How Did You Hear of Us", fields: ["How the applicant heard about the foundation", "Referral sources"] },
    { group: "COVID-19 Impact", fields: ["Impact of COVID-19 on the organization and its work"] },
    {
      group: "Organizational Budgeting, Revenue Practices and Forecasts",
      fields: [
        "Finance leadership credentials",
        "IRS status and filings",
        "History of financial mismanagement or fraud",
        "Financial health assessment",
        "Financial management structure",
        "Prior fiscal year expenses",
        "Internal audit history",
        "Fiscal sponsor details",
        "Funding allocation methodology",
        "External funding sources",
        "Income and balance sheet",
        "Insurance and liabilities",
        "Recent financial changes",
        "Current and prior budgets",
        "Revenue sources",
        "Fiscal year start and end dates",
        "Cash reserves coverage period",
        "Operating budget projections",
        "Long-term fundraising plans",
        "Living Wage Employer status",
        "Non-monetary resources",
        "GuideStar participation level",
        "Trustee count"
      ]
    },
    {
      group: "Collaborative Partnerships and Community Support",
      fields: [
        "Primary beneficiaries",
        "Community involvement in planning",
        "Current collaborating organizations",
        "Future collaboration plans",
        "Donor base overview",
        "Peer organizations in similar work",
        "Volunteer engagement",
        "Total volunteer hours",
        "Community needs and root causes"
      ]
    },
    {
      group: "Requested Grant Funding",
      fields: [
        "Rationale for grant request",
        "Alignment with foundation focus areas",
        "Funding amount requested",
        "Type of grant requested",
        "Anticipated organizational impact",
        "Grant duration and timeline",
        "Planned use of funds",
        "Lobbying activities disclosure",
        "Alternative plans if not funded",
        "Prior foundation engagement",
        "Project-generated revenue",
        "Purpose of funding",
        "Resources dedicated to project",
        "Expected learning outcomes",
        "Project success metrics",
        "Project risks and mitigation"
      ]
    },
    { group: "Time Spent Filling Out the Form", fields: ["Estimated hours spent completing the application"] },
    {
      group: "What the Organization Does",
      fields: [
        "Organization mission",
        "Current programs",
        "Project classification",
        "Geographic focus",
        "Target populations",
        "Racial equity commitments",
        "Policy and advocacy work",
        "Project scope",
        "Project risks",
        "Project timeline",
        "Project achievements",
        "Project goals and improvement strategies"
      ]
    }
  ];

  const commonFields: CommonField[] = [];
  const fieldVersions: FieldVersion[] = [];

  for (const g of groups) {
    for (const label of g.fields) {
      const id = nanoid();
      commonFields.push({
        id,
        key: slugKey(label),
        label,
        group: g.group,
        type: "textarea",
        helpText: "",
        createdAt: now()
      });

      fieldVersions.push({
        id: nanoid(),
        fieldId: id,
        version: 1,
        value: "",
        createdAt: now()
      });
    }
  }

  return { commonFields, fieldVersions };
}
