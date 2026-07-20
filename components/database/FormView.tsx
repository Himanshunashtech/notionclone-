"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@/hooks/use-supabase-db";
import { api, Id } from "@/lib/supabase-db";
import { DatabaseConfig, DatabaseProperty, defaultValueForType } from "./database-utils";
import { TableView } from "./TableView";
import { toast } from "sonner";
import { 
  Sparkles, 
  Settings, 
  Share2, 
  Lock, 
  Globe, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle, 
  Layout, 
  ListTodo, 
  HelpCircle,
  FileText,
  Clock,
  User,
  ExternalLink,
  Calendar,
  Hash,
  CheckSquare2,
  Mail,
  Link,
  Phone,
  X,
  UploadCloud,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";

const validateField = (type: string, value: string): string | null => {
  if (!value) return null;
  
  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address.";
    }
  }
  
  if (type === "url") {
    try {
      new URL(value);
    } catch {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        try {
          new URL("https://" + value);
        } catch {
          return "Please enter a valid URL.";
        }
      } else {
        return "Please enter a valid URL.";
      }
    }
  }
  
  if (type === "number") {
    if (isNaN(Number(value))) {
      return "Please enter a valid number.";
    }
  }
  
  if (type === "phone") {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-s./0-9]*$/;
    if (!phoneRegex.test(value) || value.replace(/[^0-9]/g, "").length < 7) {
      return "Please enter a valid phone number.";
    }
  }
  
  return null;
};

interface FormViewProps {
  documentId: string;
  config: DatabaseConfig & {
    formTitle?: string;
    formDescription?: string;
    formIsPublic?: boolean;
  };
  subpages: any[];
  preview?: boolean;
  onAddRow?: () => void;
}

export const FormView = ({
  documentId,
  config,
  subpages,
  preview = false,
  onAddRow,
}: FormViewProps) => {
  const { userId } = useSupabaseAuth();
  const updateDatabase = useMutation(api.documents.update);
  const createSubpage = useMutation(api.documents.create);

  const [activeSubTab, setActiveSubTab] = useState<"builder" | "responses">(preview ? "builder" : "builder");
  const [formTitle, setFormTitle] = useState(config.formTitle || "Form title");
  const [formDescription, setFormDescription] = useState(config.formDescription || "Description (optional)");
  const [formIsPublic, setFormIsPublic] = useState(config.formIsPublic ?? true);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  // Form responses local states (for submission)
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [localProperties, setLocalProperties] = useState<DatabaseProperty[]>(config.properties);

  useEffect(() => {
    setLocalProperties(config.properties);
  }, [config.properties]);

  // Initialize form default values
  useEffect(() => {
    const defaults: Record<string, string> = {};
    config.properties.forEach((prop) => {
      defaults[prop.id] = defaultValueForType(prop);
    });
    setFormValues(defaults);
  }, [config.properties]);

  // Sync state to db config when changing titles/descriptions (debounced or save button)
  const handleSaveConfig = async (updatedFields: Partial<typeof config>) => {
    if (preview) return;
    const newConfig = {
      ...config,
      ...updatedFields,
    };
    try {
      await updateDatabase({
        id: documentId as Id<"documents">,
        content: JSON.stringify(newConfig, null, 2),
      });
    } catch {
      toast.error("Failed to save form settings");
    }
  };

  const handleTogglePrivacy = () => {
    const nextVal = !formIsPublic;
    setFormIsPublic(nextVal);
    handleSaveConfig({ formIsPublic: nextVal });
    toast.success(nextVal ? "Form is now public!" : "Form is now private to members.");
  };

  const handleFileUpload = async (propId: string, file: File, type: string) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size must be under 3 MB");
      return;
    }

    if (type === "pdf" && file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (type === "image" && !file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const loadingToastId = toast.loading("Uploading file...");

    try {
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `${documentId}/${crypto.randomUUID()}.${fileExtension}`;

      const { error } = await supabase.storage
        .from("user-docs")
        .upload(uniqueFileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("user-docs")
        .getPublicUrl(uniqueFileName);

      handleFieldChange(propId, publicUrl, type);
      toast.success("File uploaded successfully!", { id: loadingToastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Upload failed: ${err.message || err}`, { id: loadingToastId });
    }
  };

  const handleFieldChange = (propId: string, value: string, type: string) => {
    setFormValues((prev) => ({
      ...prev,
      [propId]: value,
    }));

    const error = validateField(type, value);
    setFieldErrors((prev) => ({
      ...prev,
      [propId]: error,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string | null> = {};
    let hasErrors = false;

    config.properties.forEach((prop) => {
      const value = formValues[prop.id] || "";
      const error = validateField(prop.type, value);
      if (error) {
        errors[prop.id] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    // Use first non-empty value as title or default to respondent
    const firstProp = config.properties[0];
    const submitTitle = formValues[firstProp?.id] || `Submission - ${new Date().toLocaleDateString()}`;

    const initialRowContent = JSON.stringify(
      { 
        type: "database_row", 
        values: formValues 
      },
      null,
      2
    );

    const promise = createSubpage({
      title: submitTitle,
      parentDocument: documentId,
      content: initialRowContent,
    }).then(() => {
      setSubmitted(true);
    });

    toast.promise(promise, {
      loading: "Submitting form response...",
      success: "Response submitted successfully!",
      error: "Failed to submit response.",
    });
  };

  const handleAddNewField = (type: any) => {
    if (preview) return;
    const nextIndex = config.properties.length + 1;
    const name = `Question ${nextIndex}`;

    const newProp: DatabaseProperty = {
      id: `prop_${Date.now()}`,
      name: name,
      type,
      options: type === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };

    const newConfig = {
      ...config,
      properties: [...config.properties, newProp],
    };
    handleSaveConfig(newConfig);
  };

  const handleUpdateFieldName = (propId: string, newName: string) => {
    if (preview) return;
    const newConfig = {
      ...config,
      properties: config.properties.map((p) => 
        p.id === propId ? { ...p, name: newName } : p
      ),
    };
    handleSaveConfig(newConfig);
  };

  const handleUpdateOption = (propId: string, optionIndex: number, newValue: string) => {
    if (preview) return;
    const newConfig = {
      ...config,
      properties: config.properties.map((p) => {
        if (p.id !== propId) return p;
        const newOpts = [...(p.options || [])];
        newOpts[optionIndex] = newValue;
        return { ...p, options: newOpts };
      }),
    };
    handleSaveConfig(newConfig);
  };

  const handleAddOption = (propId: string) => {
    if (preview) return;
    const newConfig = {
      ...config,
      properties: config.properties.map((p) => {
        if (p.id !== propId) return p;
        const newOpts = [...(p.options || [])];
        newOpts.push(`Option ${newOpts.length + 1}`);
        return { ...p, options: newOpts };
      }),
    };
    handleSaveConfig(newConfig);
  };

  const handleDeleteOption = (propId: string, optionIndex: number) => {
    if (preview) return;
    const newConfig = {
      ...config,
      properties: config.properties.map((p) => {
        if (p.id !== propId) return p;
        const newOpts = (p.options || []).filter((_, idx) => idx !== optionIndex);
        return { ...p, options: newOpts };
      }),
    };
    handleSaveConfig(newConfig);
  };

  const handleDeleteField = (propId: string) => {
    if (preview) return;
    const newConfig = {
      ...config,
      properties: config.properties.filter((p) => p.id !== propId),
    };
    handleSaveConfig(newConfig);
  };

  // If form is private and user is not signed in
  if (preview && !formIsPublic && !userId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm max-w-lg mx-auto text-center space-y-4 my-10 animate-fade-in">
        <Lock className="h-10 w-10 text-neutral-400 dark:text-neutral-500 animate-bounce" />
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Only members can access this form</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Please log in to your Notion account or request access from the page creator to view and submit this form.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Tab bar for owners */}
      {!preview && (
        <div className="flex items-center gap-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <button
            onClick={() => setActiveSubTab("builder")}
            className={cn(
              "flex items-center gap-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition",
              activeSubTab === "builder"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
            )}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Form builder</span>
          </button>
          <button
            onClick={() => setActiveSubTab("responses")}
            className={cn(
              "flex items-center gap-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition",
              activeSubTab === "responses"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
            )}
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span>Responses ({subpages.length})</span>
          </button>
        </div>
      )}

      {/* Builder / Public View */}
      {activeSubTab === "builder" && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
            {preview ? (
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-100">
                  {formTitle}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formDescription}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    handleSaveConfig({ formTitle: e.target.value });
                  }}
                  className="w-full text-3xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-100 bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-blue-500 focus:ring-0 outline-hidden pb-1"
                />
                <textarea
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    handleSaveConfig({ formDescription: e.target.value });
                  }}
                  rows={2}
                  className="w-full text-sm text-neutral-500 dark:text-neutral-400 bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-blue-500 focus:ring-0 outline-hidden pb-1 resize-none"
                />
              </div>
            )}

            {/* Access Banner */}
            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-150 dark:border-neutral-800 rounded-xl">
              <div className="flex items-center gap-x-2 text-xs">
                {formIsPublic ? (
                  <Globe className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Lock className="h-4 w-4 text-neutral-400" />
                )}
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  {formIsPublic 
                    ? "Anyone on the web can fill out this form"
                    : "Only space members can fill out this form"}
                </span>
              </div>
              {!preview && (
                <button
                  onClick={handleTogglePrivacy}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* Form Fields Submission Screen */}
          {submitted ? (
            <div className="border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Response submitted!</h3>
              <p className="text-xs text-muted-foreground">Thank you, your answer has been safely recorded.</p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  const defaults: Record<string, string> = {};
                  config.properties.forEach((prop) => {
                    defaults[prop.id] = defaultValueForType(prop);
                  });
                  setFormValues(defaults);
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg text-xs font-semibold transition"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={preview ? handleFormSubmit : (e) => e.preventDefault()} className="space-y-4">
              {localProperties.map((prop) => (
                <div 
                  key={prop.id}
                  className="group relative border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-2xs transition-all hover:shadow-xs space-y-3"
                >
                  {/* Field Label */}
                  <div className="flex items-center justify-between">
                    {preview ? (
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {prop.name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={prop.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLocalProperties((prev) => 
                            prev.map((p) => p.id === prop.id ? { ...p, name: val } : p)
                          );
                        }}
                        onBlur={() => {
                          const updatedProp = localProperties.find((p) => p.id === prop.id);
                          if (updatedProp) {
                            handleUpdateFieldName(prop.id, updatedProp.name);
                          }
                        }}
                        className="text-sm font-bold text-neutral-800 dark:text-neutral-200 bg-transparent border-b border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:border-blue-500 focus:ring-0 outline-hidden pb-0.5"
                      />
                    )}
                    {!preview && (
                      <button
                        type="button"
                        onClick={() => handleDeleteField(prop.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Input Rendering depending on Property Type */}
                  <div className="w-full">
                    {prop.type === "checkbox" ? (
                      <div className="flex items-center gap-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={formValues[prop.id] === "true"}
                          onChange={(e) => {
                            handleFieldChange(prop.id, e.target.checked ? "true" : "false", prop.type);
                            setFieldErrors((prev) => ({ ...prev, [prop.id]: null }));
                          }}
                          className="h-4.5 w-4.5 rounded-sm border-neutral-350 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs text-neutral-500">Yes</span>
                      </div>
                    ) : prop.type === "select" ? (
                      <div className="space-y-2">
                        {preview ? (
                          (prop.options || ["Option 1", "Option 2", "Option 3"]).map((opt) => (
                            <label key={opt} className="flex items-center gap-x-2.5 text-xs text-neutral-700 dark:text-neutral-300 py-1 cursor-pointer">
                              <input
                                type="radio"
                                name={prop.id}
                                value={opt}
                                checked={formValues[prop.id] === opt}
                                onChange={(e) => {
                                  handleFieldChange(prop.id, e.target.value, prop.type);
                                  setFieldErrors((prev) => ({ ...prev, [prop.id]: null }));
                                }}
                                className="h-4 w-4 border-neutral-200 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                              />
                              <span>{opt}</span>
                            </label>
                          ))
                        ) : (
                          <div className="space-y-2">
                            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 italic mb-1">
                              (Respondents can select up to 1)
                            </div>
                            {(prop.options || ["Option 1", "Option 2", "Option 3"]).map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-x-2">
                                <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setLocalProperties((prev) => 
                                      prev.map((p) => {
                                        if (p.id !== prop.id) return p;
                                        const newOpts = [...(p.options || [])];
                                        newOpts[idx] = val;
                                        return { ...p, options: newOpts };
                                      })
                                    );
                                  }}
                                  onBlur={() => {
                                    const updatedProp = localProperties.find((p) => p.id === prop.id);
                                    if (updatedProp && updatedProp.options) {
                                      handleUpdateOption(prop.id, idx, updatedProp.options[idx]);
                                    }
                                  }}
                                  className="text-xs px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 rounded bg-transparent dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 outline-hidden flex-1"
                                />
                                {(prop.options || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOption(prop.id, idx)}
                                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 rounded transition"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(prop.id)}
                              className="flex items-center gap-x-1 text-xs text-blue-500 hover:text-blue-600 font-medium py-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add option</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : prop.type === "date" ? (
                      <input
                        type="date"
                        value={formValues[prop.id] || ""}
                        onChange={(e) => {
                          handleFieldChange(prop.id, e.target.value, prop.type);
                          setFieldErrors((prev) => ({ ...prev, [prop.id]: null }));
                        }}
                        className="w-full text-xs px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-800 focus:ring-1 focus:ring-blue-500 outline-hidden dark:text-neutral-200"
                      />
                    ) : prop.type === "pdf" || prop.type === "image" || prop.type === "file" ? (
                      <div className="space-y-2">
                        {formValues[prop.id] ? (
                          <div className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 rounded-lg animate-fade-in">
                            <div className="flex items-center gap-x-2 text-xs truncate">
                              <Paperclip className="h-4 w-4 text-neutral-400 shrink-0" />
                              <a
                                href={formValues[prop.id]}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:underline truncate max-w-sm"
                              >
                                {formValues[prop.id].split("/").pop() || "Uploaded document"}
                              </a>
                            </div>
                            {preview && (
                              <button
                                type="button"
                                onClick={() => handleFieldChange(prop.id, "", prop.type)}
                                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 rounded transition"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-upload-${prop.id}`}
                              disabled={!preview}
                              accept={
                                prop.type === "pdf" 
                                  ? "application/pdf" 
                                  : prop.type === "image" 
                                    ? "image/*" 
                                    : "*"
                              }
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(prop.id, file, prop.type);
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor={`file-upload-${prop.id}`}
                              className={cn(
                                "flex flex-col items-center justify-center p-6 border border-dashed border-neutral-350 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition cursor-pointer select-none space-y-2 text-center",
                                !preview && "opacity-75 cursor-not-allowed hover:bg-transparent"
                              )}
                            >
                              <UploadCloud className="h-6 w-6 text-neutral-400 animate-pulse" />
                              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {!preview ? "Upload field active in form preview" : `Click to upload ${prop.type.toUpperCase()}`}
                              </span>
                              <span className="text-[10px] text-neutral-450 dark:text-neutral-500">
                                Max size: 3 MB
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Respondent's answer"
                        value={formValues[prop.id] || ""}
                        onChange={(e) => {
                          handleFieldChange(prop.id, e.target.value, prop.type);
                          setFieldErrors((prev) => ({ ...prev, [prop.id]: validateField(prop.type, e.target.value) }));
                        }}
                        className="w-full text-xs px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-800 focus:ring-1 focus:ring-blue-500 outline-hidden dark:text-neutral-200"
                      />
                    )}
                  </div>

                  {/* Validation Error Message */}
                  {fieldErrors[prop.id] && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1 dark:text-red-400">
                      {fieldErrors[prop.id]}
                    </p>
                  )}
                </div>
              ))}

              {/* Action Rows */}
              <div className="flex items-center justify-between pt-2">
                {!preview ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeMenu(!showTypeMenu)}
                      className="flex items-center gap-x-1.5 px-4 py-2 border border-dashed border-neutral-300 dark:border-neutral-800 text-xs font-semibold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add question</span>
                    </button>

                    {showTypeMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Select type</span>
                          <button 
                            type="button"
                            onClick={() => setShowTypeMenu(false)}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {[
                            { label: "Text", type: "text" as const, icon: FileText },
                            { label: "Multiple choice", type: "select" as const, icon: ListTodo },
                            { label: "Date", type: "date" as const, icon: Calendar },
                            { label: "Number", type: "number" as const, icon: Hash },
                            { label: "Checkbox", type: "checkbox" as const, icon: CheckSquare2 },
                            { label: "Email", type: "email" as const, icon: Mail },
                            { label: "URL", type: "url" as const, icon: Link },
                            { label: "Phone", type: "phone" as const, icon: Phone },
                            { label: "PDF Upload", type: "pdf" as const, icon: FileText },
                            { label: "Image Upload", type: "image" as const, icon: Layout },
                            { label: "File Upload", type: "file" as const, icon: Paperclip },
                          ].map((qt) => {
                            const Icon = qt.icon;
                            return (
                              <button
                                key={qt.label}
                                type="button"
                                onClick={() => {
                                  setShowTypeMenu(false);
                                  handleAddNewField(qt.type);
                                }}
                                className="w-full flex items-center gap-x-2.5 px-2.5 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-lg transition text-left"
                              >
                                <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-medium">{qt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="flex items-center gap-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit response</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Responses tab (TableView of submitted records) */}
      {activeSubTab === "responses" && !preview && (
        <div className="space-y-4 animate-fade-in">
          <TableView
            documentId={documentId}
            config={{ ...config, viewType: "table" }}
            subpages={subpages}
            preview={true}
            onAddRow={onAddRow}
          />
        </div>
      )}
    </div>
  );
};
