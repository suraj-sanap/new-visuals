# amazon-linux-create-visual

An animated, step-by-step visual that shows **how to create (launch) an Amazon Linux 2023 server on AWS**, then connect to it with **PuTTY or MobaXterm**. The AWS Cloud diagram grows as you click through the steps, and an AWS console mock shows the exact form section to fill in. Story: Ravi rents a warehouse in the cloud. No build step, no dependencies.

Console labels and free-tier rules change over time. Check the live AWS console and the AWS pricing page.

## Moving objects

| Packet | Meaning |
|---|---|
| 🔑 | Key download and SSH login |
| ✉️ | Typed command |
| ✅ | Response coming back |

## The 12 steps

1. The big picture: what we will create
2. Sign in and pick a region
3. Launch instances and name it
4. Choose Amazon Linux 2023 (AMI)
5. Choose the instance type (size)
6. Create the key pair (.pem for MobaXterm, .ppk for PuTTY)
7. Network settings and security group (SSH 22 from My IP)
8. Storage (8 GiB gp3)
9. Launch and wait (pending, running, 2/2 checks)
10. Find the public IPv4 address
11. Connect with PuTTY or MobaXterm
12. Stop or terminate (stop the bill)

Steps 4, 6, 9, 10 and 12 also show the optional AWS CLI command.

## Run locally

```bash
cd amazon-linux-create-visual
python3 -m http.server 8000
```
Open http://localhost:8000

## Host on GitHub Pages

1. Create a repository and upload all files (keep the folders).
2. Settings > Pages.
3. Build and deployment: **Deploy from a branch**.
4. Branch **main**, folder **/ (root)**, Save.
5. Open `https://YOUR-USERNAME.github.io/REPO-NAME/` after a minute.

## Project structure

```
amazon-linux-create-visual/
  index.html     structure only
  css/style.css  theme, diagram, AWS console mock
  js/app.js      SVG builder, console mock, step data
  .nojekyll
  LICENSE        MIT (replace YOUR NAME)
  README.md
```

## Customise

- **Text:** edit `STEPS` in `js/app.js` (`plain`, `tech`, `watch`, `why`, `con` for the console form, `clicks`, `cmds`).
- **Colours:** change `--gold`, `--teal`, `--blue`, `--red`, `--green` on `.stage` in `css/style.css`.
- **Placeholders:** only `<EC2_PUBLIC_IP>`, `<AMI_ID>`, `my-key` are used. Never commit real keys or IPs.
