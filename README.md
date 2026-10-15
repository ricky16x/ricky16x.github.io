# Terminal-Style Developer Portfolio

A lightweight, static portfolio website that mimics a Linux terminal environment. It is designed for GitHub Pages and can be customized with profile data, technical skills, and sample project entries without requiring a backend or build tooling.

## Features

- Terminal-inspired interface with dark theme and window controls
- Command-driven navigation and interactive portfolio exploration
- Safe DOM rendering without unsafe `eval()` usage
- Responsive layout for desktop, tablet, and phone screens
- Theme persistence via `localStorage`
- Project data stored in a separate JSON file for easy updates
- GitHub Pages compatible static structure

## Project structure

```text
portfolio/
├── index.html
├── 404.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── commands.js
│   └── terminal.js
├── data/
│   └── projects.json
├── assets/
│   └── favicon.svg
├── README.md
├── LICENSE
└── .gitignore
```

## Customize the profile

Edit the profile values in `js/commands.js`:

```js
export const PROFILE = {
  name: 'Your Name',
  title: 'Backend Developer',
  summary: '...',
  email: 'your.email@example.com',
  github: 'https://github.com/your-github-username',
  linkedin: 'https://www.linkedin.com/in/your-linkedin-username/',
  location: 'Your City, Country',
};
```

Update the `EXPERIENCE` and `EDUCATION` arrays in the same file to reflect your real work and academic background.

## Update technical skills

The skills are stored in `SKILLS` as grouped categories in `js/commands.js`:

```js
export const SKILLS = {
  Languages: ['Java', 'C/C++', 'Golang', 'SQL'],
  'Backend Development': ['Spring Boot', 'REST APIs', 'Spring MVC', 'Microservices'],
};
```

Add or remove categories and technologies as needed.

## Add and edit projects

Project data lives in `data/projects.json` and follows a simple structure:

```json
{
  "projects": [
    {
      "id": "example-rest-api",
      "name": "Example: REST API Gateway",
      "summary": "Example backend service for API orchestration and business workflows.",
      "description": "Project description",
      "stack": ["Java", "Spring Boot", "PostgreSQL"],
      "features": ["Feature 1", "Feature 2"],
      "github": "https://github.com/your-username/project",
      "demo": "",
      "startDate": "2023-01",
      "endDate": "2023-06",
      "notes": "Optional implementation notes"
    }
  ]
}
```

Important: the sample entries should be clearly marked as examples/placeholders and not presented as actual work until you replace them with your real project data.

## Configure GitHub and LinkedIn links

Use the `PROFILE` object in `js/commands.js` as the source of truth:

- `PROFILE.github`
- `PROFILE.linkedin`
- `PROFILE.email`

These values are used by the `github`, `linkedin`, `contact`, and `copy` commands.

## Add a real resume

If you have a resume PDF, place it in `assets/resume.pdf` and the `resume` command will open it automatically. If no file is present, the `resume` command explains how to configure one instead of using a broken placeholder.

## Run locally

Because this project is static, you can run it using any simple local web server:

```bash
cd portfolio
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. Open the repository on GitHub.
3. Go to `Settings` → `Pages`.
4. For the source, choose `Deploy from a branch`.
5. Select the branch containing the site (for example `main`) and the root folder (`/`).
6. Save the configuration.
7. GitHub Pages will publish the site and give you a URL.

## Troubleshooting

- If commands do not work, check the browser console for JavaScript errors.
- If the page looks broken, confirm all asset paths are relative and the files exist.
- If `projects.json` is missing or malformed, the app falls back to the built-in sample project entry.
- If the theme does not persist, ensure browser storage is available and the site is served from a normal origin.

## Accessibility and reliability notes

- Uses semantic HTML and focus-visible styles for keyboard accessibility.
- Respects `prefers-reduced-motion` and disables animation enhancements when requested.
- Avoids unsafe runtime execution and does not use `eval()`.
- Does not require a backend, API, or secret configuration.

## License

This project uses the MIT License. See [LICENSE](LICENSE) for details.
