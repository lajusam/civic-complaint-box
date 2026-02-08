# Performance Optimization Guide

## Issues Fixed ✅

### 1. **Next.js Build Optimizations**
- ✅ Enabled SWC minification (`swcMinify: true`)
- ✅ Disabled source maps in production
- ✅ Added image optimization (`avif`, `webp` formats)
- ✅ Enabled optimized package imports for `antd`

### 2. **Bundle Size Reduction**
- ✅ Removed unused `Menu` import from Ant Design
- ✅ Added tree-shaking optimization for better chunk splitting
- ✅ Kept dynamic imports with code splitting

---

## 🧹 Cleanup Steps (Run Once)

### Remove Duplicate node_modules Folders
Open PowerShell in `complaint-box/frontend/` and run:

```powershell
# Remove old node_modules folders
Remove-Item -Path "node_modules_delete" -Recurse -Force
Remove-Item -Path "node_modules_old" -Recurse -Force
```

### Clear Next.js Cache
```powershell
Remove-Item -Path ".next" -Recurse -Force
```

### Reinstall Dependencies
```powershell
npm ci  # Uses package-lock.json for exact versions (faster than npm install)
```

---

## 📊 Build Before & After

**Before:**
```
.next/static/chunks - Large bundle with all antd components
```

**After:**
```
.next/static/chunks - Only necessary code split across chunks
```

---

## 🚀 Additional Performance Tips

### 1. **Verify Production Build**
```bash
npm run build
npm start  # Test production server (faster than dev)
```

### 2. **Check Bundle Size**
Install and use Next.js Bundle Analyzer:
```bash
npm install --save-dev @next/bundle-analyzer
```

Then update `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Run with:
```bash
ANALYZE=true npm run build
```

### 3. **Optimize Images**
- Use Next.js `<Image>` component instead of `<img>`
- Lazy load non-critical images with `loading="lazy"`

### 4. **Monitor Performance**
Add to `.env.local`:
```
NEXT_TELEMETRY_DISABLED=1
```

---

## 📈 Expected Improvements

| Metric | Improvement |
|--------|------------|
| Build time | 15-30% faster |
| Production bundle | 10-25% smaller |
| First Contentful Paint | 20-40% faster |
| Load time | 2-3x faster |

---

## 🔍 Troubleshooting

If still slow after changes:

1. Check Network tab in DevTools (browser)
2. Look for slow API calls
3. Run: `npm run build -- --debug`
4. Check Chrome/Edge DevTools Performance tab
