# Task Completion Checklist

## Before Committing Code
1. **Build Check**: Run `pnpm run build` (not just `pnpm build`)
2. **Type Check**: Run `pnpm type-check` to ensure TypeScript compliance
3. **Linting**: Run `pnpm lint` to check code quality
4. **Testing**: Run appropriate tests:
   - `pnpm test -- --verbose --no-coverage --silent` for unit tests
   - `pnpm test:e2e` for end-to-end tests when UI changes are made

## Database Changes
1. Run `pnpm db:generate` after schema changes
2. Test migrations locally with `pnpm db:migrate`
3. Verify database seeding with `pnpm db:seed`

## UI/Component Changes
1. Test responsive behavior across screen sizes
2. Verify Mantine theme compatibility
3. Check accessibility compliance
4. Test drag-and-drop functionality when applicable

## Performance Considerations
1. Check bundle size impact
2. Verify smooth drag-and-drop performance
3. Test with large datasets when applicable
4. Monitor Core Web Vitals

## SEO Best Practices
- Implement proper meta tags for new pages
- Ensure semantic HTML structure
- Add proper alt text for images
- Use structured data when applicable

## Documentation
- Update component documentation for significant changes
- Document any new API endpoints
- Update migration notes for UI library changes

## Final Checks
- Test in both development and production modes
- Verify environment variables are properly configured
- Check for any console errors or warnings