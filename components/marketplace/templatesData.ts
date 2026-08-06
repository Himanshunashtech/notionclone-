import { MarketplaceTemplate, CategoryItem } from "./types";

export const TEMPLATES: MarketplaceTemplate[] = [
  {
    id: "bug-tracker",
    title: "ACME_Bugs",
    description:
      "Easily manage the bugs for your products and projects with this Bug Tracking System template. Includes Table and Board views, Priority, Severity, Status, Product/Feature, Assignee, Created by, Created time, Due Date, and reproduction templates.",
    icon: "🐞",
    category: ["engineering", "project-management"],
    previewImage: "/marketplace/t1.png",
    accentFrom: "from-red-950",
    accentTo: "to-orange-950",
    accentBorder: "border-red-800/40",
    lightAccentFrom: "from-red-50",
    lightAccentTo: "to-orange-50",
    lightAccentBorder: "border-red-200/60",
    creator: { name: "Zotion Team", avatar: "ZT", templateCount: 1 },
    stats: { uses: "5.3k", rating: 4.7 },
    isFree: true,
    layoutType: "numbered",
    dbConfig: JSON.stringify({
      type: "database",
      viewType: "table",
      views: ["table", "board"],
      properties: [
        { id: "id_no", name: "ID", type: "number" },
        { id: "status", name: "Status", type: "select", options: ["New", "Reviewed", "Planned", "In Development", "Fixed", "In Testing", "Testing Complete", "Deployed", "Closed", "Rejected"] },
        { id: "priority", name: "Priority", type: "select", options: ["P1", "P2", "P3"] },
        { id: "severity", name: "Severity", type: "select", options: ["S1", "S2", "S3", "S4"] },
        { id: "product_feature", name: "Product/Feature", type: "multiselect", options: ["Frontend", "Backend", "API", "Mobile"] },
        { id: "assignee", name: "Assignee", type: "text" },
        { id: "created_by", name: "Created by", type: "text" },
        { id: "created_time", name: "Created time", type: "date" },
        { id: "due_date", name: "Due Date", type: "date" }
      ],
      initialRows: [
        {
          id_no: 10,
          title: "Database Error Causes Incorrect Data Display in User Profiles",
          priority: "P2",
          severity: "S2",
          status: "Planned",
          product_feature: ["Backend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: "2024-05-15",
          content: JSON.stringify([
            { id: "env-box", type: "callout", props: { icon: "💻" }, content: [{ type: "text", text: "Environment: Browser | Smartphone | Version | Size", styles: { bold: true } }] },
            { id: "heading-1", type: "heading", props: { level: 3 }, content: [{ type: "text", text: "📑 STEPS TO REPRODUCE", styles: { bold: true } }] },
            { id: "step-1", type: "numberedListItem", content: [{ type: "text", text: "Go to User Settings..." }] },
            { id: "step-2", type: "numberedListItem", content: [{ type: "text", text: "List items..." }] },
            { id: "heading-2", type: "heading", props: { level: 3 }, content: [{ type: "text", text: "✅ EXPECTED RESULTS", styles: { bold: true } }] },
            { id: "exp-1", type: "bulletListItem", content: [{ type: "text", text: "User profile data loads correctly from database." }] },
            { id: "heading-3", type: "heading", props: { level: 3 }, content: [{ type: "text", text: "⛔ ACTUAL RESULTS", styles: { bold: true } }] },
            { id: "act-1", type: "bulletListItem", content: [{ type: "text", text: "Database returns null causing empty fields." }] }
          ])
        },
        {
          id_no: 9,
          title: "Navigation Bar Overlaps Content on Mobile Devices",
          priority: "P3",
          severity: "",
          status: "Rejected",
          product_feature: ["Frontend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: ""
        },
        {
          id_no: 8,
          title: "API Response Time Slows Down During Peak Traffic Hours",
          priority: "P1",
          severity: "S2",
          status: "Fixed",
          product_feature: ["Backend", "API"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: ""
        },
        {
          id_no: 7,
          title: "Footer Links Redirect to Incorrect Pages",
          priority: "",
          severity: "S3",
          status: "New",
          product_feature: ["Frontend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: ""
        },
        {
          id_no: 6,
          title: "Server Crashes When Processing Large File Uploads",
          priority: "P3",
          severity: "S1",
          status: "Planned",
          product_feature: ["API"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: "2024-05-13"
        },
        {
          id_no: 5,
          title: "User Authentication Fails after Multiple Login Attempts",
          priority: "P1",
          severity: "S2",
          status: "Planned",
          product_feature: ["Backend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: "2024-05-10"
        },
        {
          id_no: 4,
          title: "Scheduled Task for Data Backup Fails to Execute Daily",
          priority: "P1",
          severity: "S2",
          status: "Planned",
          product_feature: ["Backend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: "2024-05-09"
        },
        {
          id_no: 3,
          title: "Submit Button Unresponsive on Firefox Browser",
          priority: "P1",
          severity: "S3",
          status: "Planned",
          product_feature: ["Frontend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: "2024-05-23"
        },
        {
          id_no: 2,
          title: "Image Carousel Slideshow Freezes on Internet Explorer",
          priority: "P2",
          severity: "S1",
          status: "In Development",
          product_feature: ["Frontend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: ""
        },
        {
          id_no: 1,
          title: "Dropdown Menu Disappears on Hover in Safari Browser",
          priority: "",
          severity: "S2",
          status: "New",
          product_feature: ["Frontend"],
          assignee: "Bogdan Cozma",
          created_by: "Sonu",
          created_time: "2026-07-25",
          due_date: ""
        }
      ]
    }),
    dbType: "table",
  },
  {
    id: "client-call-followup",
    title: "Client Call & Follow-Up",
    description:
      "Streamline your client communications, track inbound and outbound calls, schedule follow-ups, and maintain a complete history of client relationships with custom Status Board and All Calls views.",
    icon: "📞",
    category: ["productivity", "project-management"],
    previewImage: "/marketplace/c1.png",
    accentFrom: "from-amber-950",
    accentTo: "to-orange-950",
    accentBorder: "border-amber-800/40",
    lightAccentFrom: "from-amber-50",
    lightAccentTo: "to-orange-50",
    lightAccentBorder: "border-amber-200/60",
    creator: { name: "Zotion Team", avatar: "ZT", templateCount: 2 },
    stats: { uses: "3.8k", rating: 4.9 },
    isFree: true,
    layoutType: "split-left",
    dbConfig: JSON.stringify({
      isMultiDatabase: true,
      childDatabases: [
        {
          title: "CALLS",
          icon: "📞",
          dbConfig: {
            type: "database",
            viewType: "table",
            views: ["table", "board"],
            properties: [
              { id: "status", name: "Status", type: "select", options: ["Pending", "In Progress", "Rescheduled", "Placed", "Cancelled"] },
              { id: "client", name: "Client", type: "text" },
              { id: "date_time", name: "Date and Time", type: "date" },
              { id: "purpose", name: "Purpose", type: "text" },
              { id: "person_responsible", name: "Person Responsible", type: "text" },
              { id: "type", name: "Type", type: "select", options: ["Inbound", "Outbound"] },
              { id: "result", name: "Result", type: "select", options: ["Connected", "Needs Follow-up"] },
              { id: "priority", name: "Priority", type: "select", options: ["Low", "Medium", "High"] }
            ],
            initialRows: [
              {
                title: "Feedback",
                status: "Cancelled",
                client: "Bright Future Foundation",
                date_time: "2025-08-05",
                purpose: "Feedback of the proposal",
                person_responsible: "Ivy Saskia",
                type: "Inbound",
                result: "Connected",
                priority: "Medium"
              },
              {
                title: "Initial Contact",
                status: "Pending",
                client: "Bbox",
                date_time: "2025-08-01",
                purpose: "Introduce our service",
                person_responsible: "Ivy Saskia",
                type: "Inbound",
                result: "Needs Follow-up",
                priority: "Low"
              },
              {
                title: "Initial Contact with ABC Corp",
                status: "Pending",
                client: "Bright Future Foundation",
                date_time: "2025-07-29",
                purpose: "Introduction to our new service offerings",
                person_responsible: "Ivy Saskia",
                type: "Outbound",
                result: "Connected",
                priority: "High"
              },
              {
                title: "Support Call from XYZ Industries",
                status: "Rescheduled",
                client: "Innovate Corp",
                date_time: "2025-07-28",
                purpose: "Troubleshooting Integration Issues",
                person_responsible: "Ycel Cardona Mendez",
                type: "Inbound",
                result: "Connected",
                priority: "High"
              },
              {
                title: "Quarterly Review with Tech Solutions",
                status: "Placed",
                client: "Acme Technology Solutions",
                date_time: "2025-07-21",
                purpose: "Review Q2 performance and discuss Q3 goals",
                person_responsible: "Ycel Cardona Mendez",
                type: "Outbound",
                result: "Needs Follow-up",
                priority: "Medium"
              }
            ]
          }
        },
        {
          title: "CLIENTS",
          icon: "📞",
          dbConfig: {
            type: "database",
            viewType: "table",
            views: ["table", "board"],
            properties: [
              { id: "email", name: "Email", type: "text" },
              { id: "phone", name: "Phone", type: "text" },
              { id: "label", name: "Label", type: "select", options: ["Active", "Potential", "Inactive"] },
              { id: "last_call", name: "Last Call", type: "text" },
              { id: "next_call", name: "Next Call", type: "text" },
              { id: "recurrence", name: "Recurrence", type: "select", options: ["3 weeks", "1 week", "Every friday"] },
              { id: "notes", name: "Notes", type: "text" }
            ],
            initialRows: [
              {
                title: "Acme Technology Solutions",
                email: "john.smith@acmetech.com",
                phone: "(555) 123-4567",
                label: "Active",
                last_call: "Previous call 10 days ago: July 21, 2025 : Quarterly Review with Tech Solutions - Placed",
                next_call: "No next calls",
                recurrence: "3 weeks",
                notes: "Long-term client since 2023. Interested in expanding services."
              },
              {
                title: "Bbox",
                email: "bbox@gmail.com",
                phone: "(591) 777-7777",
                label: "Potential",
                last_call: "No previous calls",
                next_call: "Next call in coming 7 days: August 1, 2025 : Initial Contact - Pending",
                recurrence: "",
                notes: ""
              },
              {
                title: "Bright Future Foundation",
                email: "sjohnson@brightfuture.org",
                phone: "(555) 987-6543",
                label: "Potential",
                last_call: "Previous call 2 days ago: July 29, 2025 : Initial Contact with ABC Corp - Pending",
                next_call: "Next call in coming 7 days: August 5, 2025 : Feedback - Cancelled",
                recurrence: "1 week",
                notes: "Non-profit looking for affordable solutions. Send follow-up materials."
              },
              {
                title: "Innovate Corp",
                email: "mchen@innovatecorp.com",
                phone: "(555) 456-7890",
                label: "Inactive",
                last_call: "Previous call 3 days ago: July 28, 2025 : Support Call from XYZ Industries - Rescheduled",
                next_call: "No next calls",
                recurrence: "Every friday",
                notes: "Was active client until June 2025. May need to offer discount."
              }
            ]
          }
        }
      ]
    }),
    dbType: "table",
  },
];

export const CATEGORIES: CategoryItem[] = [
  { id: "all", label: "All Templates", icon: "✨", color: "bg-gradient-to-r from-violet-500 to-purple-500" },
  { id: "project-management", label: "Project Management", icon: "🎯", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  { id: "productivity", label: "Productivity", icon: "⚡", color: "bg-gradient-to-r from-amber-500 to-orange-500" },
  { id: "student", label: "Student", icon: "🎓", color: "bg-gradient-to-r from-violet-500 to-indigo-500" },
  { id: "design", label: "Design", icon: "🎨", color: "bg-gradient-to-r from-pink-500 to-rose-500" },
  { id: "marketing", label: "Marketing", icon: "📢", color: "bg-gradient-to-r from-green-500 to-emerald-500" },
  { id: "engineering", label: "Engineering", icon: "🔧", color: "bg-gradient-to-r from-slate-500 to-gray-500" },
  { id: "personal", label: "Personal", icon: "🏠", color: "bg-gradient-to-r from-teal-500 to-cyan-500" },
  { id: "finance", label: "Finance", icon: "💰", color: "bg-gradient-to-r from-lime-500 to-green-500" },
];
