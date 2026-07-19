import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ModalProvider } from "@/components/providers/modal-provider";

// Pages
import LandingPage from "@/app/(landing)/page";
import DocumentsPage from "@/app/(main)/(routes)/documents/page";
import DocumentIdPage from "@/app/(main)/(routes)/documents/[documentId]/page";
import PreviewPage from "@/app/(public)/(routes)/preview/[documentId]/page";
import LibraryPage from "@/app/(main)/(routes)/library/page";
import CalendarPage from "@/app/(main)/(routes)/calendar/page";
import OverviewPage from "@/app/(landing)/(routes)/overview/page";
import PricingPage from "@/app/(landing)/(routes)/pricing/page";
import IntegrationsPage from "@/app/(landing)/(routes)/integrations/page";
import ChangelogPage from "@/app/(landing)/(routes)/changelog/page";
import RoadmapPage from "@/app/(landing)/(routes)/roadmap/page";
import AboutPage from "@/app/(landing)/(routes)/about/page";
import CareersPage from "@/app/(landing)/(routes)/careers/page";
import PressPage from "@/app/(landing)/(routes)/press/page";
import BlogPage from "@/app/(landing)/(routes)/blog/page";
import CulturePage from "@/app/(landing)/(routes)/culture/page";
import PrivacyPage from "@/app/(landing)/(routes)/privacy/page";
import TermsPage from "@/app/(landing)/(routes)/terms/page";
import SecurityPage from "@/app/(landing)/(routes)/security/page";
import CookiesPage from "@/app/(landing)/(routes)/cookies/page";
import NotFound from "@/app/not-found";

// Layouts
import LandingLayout from "@/app/(landing)/layout";
import MainLayout from "@/app/(main)/layout";

import { ReduxProvider } from "@/components/providers/redux-provider";

// Shim helper for Next.js async page params
const DocumentIdPageWrapper = () => {
  const { documentId } = useParams();
  const params = React.useMemo(() => ({
    documentId: documentId as any,
  }), [documentId]);
  return <DocumentIdPage key={documentId} params={params} />;
};

const PreviewPageWrapper = () => {
  const { documentId } = useParams();
  const params = React.useMemo(() => ({
    documentId: documentId as any,
  }), [documentId]);
  return <PreviewPage key={documentId} params={params} />;
};

export default function App() {
  return (
    <ReduxProvider>
      <SupabaseProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="zotion-theme-2"
        >
          <ToasterProvider />
          <ModalProvider />
          
          <Routes>
            {/* Landing routes */}
            <Route
              path="/"
              element={
                <LandingLayout>
                  <LandingPage />
                </LandingLayout>
              }
            />
            <Route
              path="/overview"
              element={
                <LandingLayout>
                  <OverviewPage />
                </LandingLayout>
              }
            />
            <Route
              path="/pricing"
              element={
                <LandingLayout>
                  <PricingPage />
                </LandingLayout>
              }
            />
            <Route
              path="/integrations"
              element={
                <LandingLayout>
                  <IntegrationsPage />
                </LandingLayout>
              }
            />
            <Route
              path="/changelog"
              element={
                <LandingLayout>
                  <ChangelogPage />
                </LandingLayout>
              }
            />
            <Route
              path="/roadmap"
              element={
                <LandingLayout>
                  <RoadmapPage />
                </LandingLayout>
              }
            />
            <Route
              path="/about"
              element={
                <LandingLayout>
                  <AboutPage />
                </LandingLayout>
              }
            />
            <Route
              path="/careers"
              element={
                <LandingLayout>
                  <CareersPage />
                </LandingLayout>
              }
            />
            <Route
              path="/press"
              element={
                <LandingLayout>
                  <PressPage />
                </LandingLayout>
              }
            />
            <Route
              path="/blog"
              element={
                <LandingLayout>
                  <BlogPage />
                </LandingLayout>
              }
            />
            <Route
              path="/culture"
              element={
                <LandingLayout>
                  <CulturePage />
                </LandingLayout>
              }
            />
            <Route
              path="/privacy"
              element={
                <LandingLayout>
                  <PrivacyPage />
                </LandingLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <LandingLayout>
                  <TermsPage />
                </LandingLayout>
              }
            />
            <Route
              path="/security"
              element={
                <LandingLayout>
                  <SecurityPage />
                </LandingLayout>
              }
            />
            <Route
              path="/cookies"
              element={
                <LandingLayout>
                  <CookiesPage />
                </LandingLayout>
              }
            />

            <Route
              path="/documents"
              element={
                <MainLayout>
                  <DocumentsPage />
                </MainLayout>
              }
            />
            <Route
              path="/library"
              element={
                <MainLayout>
                  <LibraryPage />
                </MainLayout>
              }
            />
            <Route
              path="/calendar"
              element={
                <MainLayout>
                  <CalendarPage />
                </MainLayout>
              }
            />
            <Route
              path="/documents/:documentId"
              element={
                <MainLayout>
                  <DocumentIdPageWrapper />
                </MainLayout>
              }
            />
            <Route
              path="/preview/:documentId"
              element={<PreviewPageWrapper />}
            />
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </ThemeProvider>
      </SupabaseProvider>
    </ReduxProvider>
  );
}
