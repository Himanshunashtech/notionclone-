const fs = require("fs");
const path = require("path");

const rootDirs = [
  path.join(__dirname, "..", "app"),
  path.join(__dirname, "..", "components"),
  path.join(__dirname, "..", "hooks"),
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [];
rootDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    files.push(...walk(dir));
  }
});

console.log(`Found ${files.length} TypeScript files.`);

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  // 1. Replace convex/react queries/mutations
  content = content.replace(
    /import\s+\{\s*(useQuery|useMutation)\s*,\s*(useQuery|useMutation)\s*\}\s*from\s*["']convex\/react["'];?/g,
    'import { useQuery, useMutation } from "@/hooks/use-supabase-db";'
  );
  content = content.replace(
    /import\s+\{\s*(useQuery|useMutation)\s*\}\s*from\s*["']convex\/react["'];?/g,
    (match, p1) => {
      return `import { ${p1} } from "@/hooks/use-supabase-db";`;
    }
  );

  // 2. Replace useConvexAuth import
  content = content.replace(
    /import\s+\{\s*useConvexAuth\s*\}\s*from\s*["']convex\/react["'];?/g,
    'import { useConvexAuth } from "@/components/providers/supabase-provider";'
  );

  // 3. Replace convex api and dataModel imports
  content = content.replace(
    /import\s+\{\s*api\s*\}\s*from\s*["']@\/convex\/_generated\/api["'];?/g,
    'import { api } from "@/lib/supabase-db";'
  );
  content = content.replace(
    /import\s+\{\s*(Doc|Id)\s*,\s*(Doc|Id)\s*\}\s*from\s*["']@\/convex\/_generated\/dataModel["'];?/g,
    'import { Doc, Id } from "@/lib/supabase-db";'
  );
  content = content.replace(
    /import\s+\{\s*(Doc|Id)\s*\}\s*from\s*["']@\/convex\/_generated\/dataModel["'];?/g,
    (match, p1) => {
      return `import { ${p1} } from "@/lib/supabase-db";`;
    }
  );

  // 4. Replace clerk buttons with custom auth-components
  // Case A: import buttons only
  content = content.replace(
    /import\s+\{\s*(SignInButton|SignUpButton|SignOutButton|UserButton)\s*(?:,\s*(SignInButton|SignUpButton|SignOutButton|UserButton)\s*)*\}\s*from\s*["']@clerk\/nextjs["'];?/g,
    (match) => {
      // Find all components listed inside {}
      const matches = match.match(/SignInButton|SignUpButton|SignOutButton|UserButton/g);
      return `import { ${matches.join(", ")} } from "@/components/auth-components";`;
    }
  );

  // Case B: import useUser / useAuth from @clerk/nextjs
  content = content.replace(
    /import\s+\{\s*useUser\s*\}\s*from\s*["']@clerk\/nextjs["'];?/g,
    'import { useUser } from "@/components/providers/supabase-provider";'
  );
  content = content.replace(
    /import\s+\{\s*useAuth\s*\}\s*from\s*["']@clerk\/nextjs["'];?/g,
    'import { useSupabaseAuth as useAuth } from "@/components/providers/supabase-provider";'
  );

  // Case C: mixed imports from @clerk/nextjs
  content = content.replace(
    /import\s+\{\s*([^}]+)\s*\}\s*from\s*["']@clerk\/nextjs["'];?/g,
    (match, p1) => {
      const parts = p1.split(",").map(s => s.trim());
      const hookParts = parts.filter(p => p === "useUser" || p === "useAuth" || p === "useClerk");
      const componentParts = parts.filter(p => p === "SignInButton" || p === "SignUpButton" || p === "SignOutButton" || p === "UserButton");
      
      let imports = [];
      if (hookParts.length > 0) {
        // useClerk can be mapped to useSupabaseAuth
        const mappedHooks = hookParts.map(h => {
          if (h === "useClerk") return "useSupabaseAuth as useClerk";
          return h;
        });
        imports.push(`import { ${mappedHooks.join(", ")} } from "@/components/providers/supabase-provider";`);
      }
      if (componentParts.length > 0) {
        imports.push(`import { ${componentParts.join(", ")} } from "@/components/auth-components";`);
      }
      return imports.join("\n");
    }
  );

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated: ${path.relative(path.join(__dirname, ".."), file)}`);
  }
});

console.log("Migration script complete.");
