# Landing Page - Quick Reference Guide

## 📁 File Structure

```
frontend/src/
├── pages/
│   ├── landingPage.jsx                 # Entry point (now clean & modular!)
│   └── landing/
│       ├── landingData.js              # All content data
│       └── LANDING_PAGE_REFACTOR.md    # Detailed docs
├── components/
│   ├── common/
│   │   ├── Button.jsx                  # Reusable button
│   │   ├── Navbar.jsx                  # Navigation bar
│   │   ├── Footer.jsx                  # Footer
│   │   ├── Container.jsx               # Layout wrapper
│   │   └── index.js                    # Clean exports
│   └── landing/
│       ├── HeroSection.jsx             # Hero banner
│       ├── FeaturesSection.jsx         # Features grid
│       ├── HowItWorksSection.jsx       # Timeline/steps
│       ├── BenefitsSection.jsx         # Why choose us
│       ├── ContactSection.jsx          # Contact form
│       ├── CtaSection.jsx              # Call to action
│       ├── FeatureCard.jsx             # Card component
│       ├── BenefitCard.jsx             # Benefit card
│       ├── TimelineStep.jsx            # Timeline item
│       ├── SectionHeader.jsx           # Section header
│       └── index.js                    # Clean exports
└── utils/
    └── animations.js                   # Framer Motion variants
```

## 🎨 Component Variants

### Button
```javascript
<Button variant="primary|secondary|outline|ghost" size="sm|md|lg" />
```

### Container (Layout Wrapper)
```javascript
<Container section id="features" bg="white|gray|gradient|gradient-light">
  {children}
</Container>
```

### SectionHeader
```javascript
<SectionHeader 
  badge="Optional badge"
  title="Main Title"
  subtitle="Optional subtitle"
/>
```

## 🚀 Quick Tasks

### ✏️ Edit Landing Page Content
1. Open: `frontend/src/pages/landing/landingData.js`
2. Modify content arrays (FEATURES, BENEFITS, TIMELINE_STEPS, etc.)
3. Save and refresh browser

### 🎨 Change Colors
1. Search component files for `from-blue-600` or similar
2. Replace with your color (e.g., `from-red-600`)
3. Tailwind CSS colors available: https://tailwindcss.com/docs/customization/colors

### 📱 Test Responsive Design
1. Open DevTools (F12)
2. Click device toggle (mobile icon)
3. Test on: Mobile (375px), Tablet (768px), Desktop (1024px+)

### ✨ Add Animations
1. Check `utils/animations.js` for animation variants
2. Use: `variants={fadeInUp}` or custom animations
3. See Framer Motion docs: https://www.framer.com/motion/

### 🔗 Add New Navigation Link
1. In `Navbar.jsx`: Add to `navLinks` array
2. Navbar automatically handles scroll-to-section

### 📝 Add New Section
1. Create component: `components/landing/NewSection.jsx`
2. Add data: `pages/landing/landingData.js`
3. Import in `pages/landingPage.jsx`
4. Add JSX: `<NewSection />`

## 🎯 Key Features

| Feature | Location |
|---------|----------|
| Smooth scrolling | Navbar + data-id links |
| Mobile menu | Navbar.jsx |
| Animations | HeroSection, Cards, Timeline |
| Contact form | ContactSection.jsx |
| Trust indicators | HeroSection.jsx |
| Timeline visualization | TimelineStep.jsx |

## 🐛 Troubleshooting

### Links not scrolling?
- Make sure section has `id="feature-name"`
- Check Navbar href matches section id

### Animations not showing?
- Use Chrome/Firefox (best support)
- Check `utils/animations.js` for variants
- Ensure `motion` component is imported from 'framer-motion'

### Mobile menu not closing?
- Click link or close button
- Should close automatically on navigation

### Styling not applying?
- Check Tailwind is imported in main.jsx
- Verify class names match Tailwind syntax
- Clear browser cache if needed

## 📊 Performance Tips

✅ **Do:**
- Keep components under 200 lines
- Use animation variants from utils
- Separate data from components
- Import from index.js files

❌ **Don't:**
- Don't hardcode content in components
- Don't create massive components
- Don't ignore Tailwind design system
- Don't skip viewport props in animations

## 🧪 Testing Checklist

Before deploying:
- [ ] All links functional
- [ ] Responsive on mobile/tablet
- [ ] Smooth animations
- [ ] Contact form submits
- [ ] Navigation scrolls correctly
- [ ] No console errors
- [ ] Load time acceptable

## 📞 Support References

- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion/
- **React Router**: https://reactrouter.com
- **React Icons**: https://react-icons.github.io/react-icons/

## 🚀 Deployment Notes

Before production:
1. Run `npm run build`
2. Check build output for warnings
3. Test build locally: `npm run preview`
4. Deploy to your hosting platform

---

**Last Updated**: May 1, 2026  
**Quick Ref Version**: 1.0
