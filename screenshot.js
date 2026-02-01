import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

async function takeScreenshots() {
  // Start the dev server
  console.log('Starting dev server...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('Local:')) {
        setTimeout(resolve, 2000);
      }
    });
  });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Loading page...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Wait for WebGL to render
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Screenshot 1: Initial title screen
  console.log('Taking screenshot 1: Title screen...');
  await page.screenshot({ path: 'screenshot_title.png', fullPage: false });

  // Scroll down to see project tiles
  console.log('Scrolling to projects...');
  await page.evaluate(() => {
    for (let i = 0; i < 50; i++) {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
    }
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Screenshot 2: Project tiles view
  console.log('Taking screenshot 2: Project tiles...');
  await page.screenshot({ path: 'screenshot_projects.png', fullPage: false });

  // Scroll to end
  console.log('Scrolling to end...');
  await page.evaluate(() => {
    for (let i = 0; i < 100; i++) {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
    }
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Screenshot 3: End/Services section
  console.log('Taking screenshot 3: Services section...');
  await page.screenshot({ path: 'screenshot_services.png', fullPage: false });

  console.log('Screenshots saved!');

  await browser.close();
  server.kill();
  process.exit(0);
}

takeScreenshots().catch(err => {
  console.error(err);
  process.exit(1);
});
