# Screenshot Upload Feature for GitHub Issues

## Overview
Mosqit now automatically uploads screenshots to your GitHub repository when creating bug reports, embedding them directly in the issue body. This provides visual context for bug reports without requiring manual screenshot handling.

## How It Works

### 1. Screenshot Capture
When you use the Visual Bug Capture feature in Mosqit:
- Select an element on the page using the enhanced blue inspector
- The extension captures a screenshot with the element highlighted
- The screenshot is stored as a base64 data URL

### 2. Automatic Upload Process
When submitting an issue to GitHub:
1. **Size Check**: The extension verifies the screenshot is under 5MB
2. **Upload to Repository**: Uses GitHub's Contents API to upload the image
3. **Automatic Naming**: Screenshots are named with timestamp and issue reference
   - Format: `screenshot-issue-{number}-{timestamp}.png`
   - Stored in repository root or `mosqit-screenshots/` folder if available

### 3. Embedding in Issue
The uploaded screenshot is automatically embedded in the issue body:
- Placed after the bug description for immediate visual context
- Uses standard GitHub markdown image syntax
- Fully visible in the issue without clicking links

## Technical Implementation

### API Endpoints Used
- **Upload**: `PUT /repos/{owner}/{repo}/contents/{path}`
- **Issue Creation**: `POST /repos/{owner}/{repo}/issues`

### Code Flow
```javascript
1. captureScreenshot() → base64 image
2. uploadScreenshotToGitHub() → uploads to repo, returns URL
3. createGitHubIssue() → embeds URL in markdown body
4. GitHub renders the image inline
```

### Error Handling
- **Large Screenshots**: Automatically skipped if >5MB with warning
- **Upload Failures**: Issue creation continues without screenshot
- **Missing Permissions**: Falls back to text-only issue

## Configuration Requirements

### GitHub Token Permissions
Your personal access token needs:
- `repo` scope (full repository access)
- OR at minimum: `public_repo` + `repo:status`

### Repository Setup
No special setup required! The extension will:
- Create screenshots in the repository root by default
- Attempt to create a `mosqit-screenshots/` folder if possible
- Work with any branch (defaults to `main`)

## Benefits

### For Bug Reporters
- **No Manual Upload**: Screenshots automatically included
- **Visual Context**: Issues have immediate visual reference
- **Persistent Storage**: Images stored in repository, not external services

### For Developers
- **Clear Bug Reports**: Visual context reduces back-and-forth
- **Organized Storage**: Screenshots grouped in repository
- **Version Control**: Images tracked with repository history

## Usage Guide

1. **Capture Bug**:
   - Open DevTools → Mosqit panel
   - Click "Start Visual Bug Capture"
   - Select the problematic element (blue highlight appears)
   - Screenshot is captured automatically

2. **Create Issue**:
   - Fill in bug description and expected behavior
   - Click "Generate Issue with AI"
   - Click "Submit to GitHub"

3. **Automatic Upload**:
   - Progress shows "📸 Uploading screenshot..."
   - Screenshot uploads to repository
   - Issue created with embedded image

## Limitations

### Size Restrictions
- Maximum screenshot size: 5MB
- Larger screenshots automatically skipped
- GitHub API limit: 10MB per file

### Permission Requirements
- Requires repository write access
- Token must have content creation permissions

### Storage Considerations
- Screenshots permanently stored in repository
- Increases repository size over time
- Consider periodic cleanup of old screenshots

## Troubleshooting

### Screenshot Not Appearing
1. Check token has `repo` scope
2. Verify screenshot is under 5MB
3. Ensure repository exists and is accessible
4. Check browser console for upload errors

### Upload Failures
- **401 Error**: Invalid or expired token
- **404 Error**: Repository not found or no access
- **422 Error**: File already exists or validation error

### Performance Issues
- Large screenshots may slow upload
- Consider reducing capture area
- Network speed affects upload time

## Security Considerations

### Data Privacy
- Screenshots stored in your repository
- Visible to anyone with repository access
- Consider sensitive information in captures

### Token Security
- Never share your GitHub token
- Use tokens with minimal required scope
- Rotate tokens regularly

## Future Enhancements

### Planned Features
- [ ] Configurable storage location
- [ ] Automatic image compression
- [ ] Multiple screenshot support
- [ ] Screenshot annotation before upload
- [ ] Cleanup utility for old screenshots

### Under Consideration
- Integration with GitHub's image CDN
- Support for other image formats
- Batch upload for multiple screenshots
- Screenshot comparison tools

## API Reference

### uploadScreenshotToGitHub(settings, screenshot, issueNumber)
Uploads a base64 screenshot to GitHub repository.

**Parameters:**
- `settings`: Object with `token` and `repo` (owner/name format)
- `screenshot`: Base64 data URL of the image
- `issueNumber`: Issue number for naming (optional)

**Returns:**
- `string`: URL of uploaded image or `null` if failed

### Integration Points
The feature integrates with:
- Native inspector for element selection
- GitHub issue creation workflow
- AI-powered issue generation
- Progress tracking system

## Example Issue with Screenshot

```markdown
## Bug Description
Button does not respond to clicks on mobile view

## Screenshot
![Bug Screenshot](https://raw.githubusercontent.com/user/repo/main/screenshot-issue-42-2024-01-15.png)

## Expected Behavior
Button should trigger dropdown menu when clicked

## Steps to Reproduce
1. Navigate to `/products`
2. Switch to mobile view
3. Click on filter button
```

## Conclusion

The screenshot upload feature streamlines bug reporting by automatically handling image uploads and embedding. This creates more comprehensive bug reports with visual context, improving communication between reporters and developers.

For questions or issues with this feature, please create an issue in the Mosqit repository.