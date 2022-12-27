const pup = require('puppeteer');

fetch('https://get.cbord.com/nku/full/login.php').then(res => login_and_get_data(res.url, 'username', 'password'));

async function login_and_get_data(url, username, password) {
  const browser = await pup.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const usernameField = await page.$('#userNameInput');
  await usernameField.type(username);

  const nextButton = await page.$('#nextButton');
  await nextButton.click()

  const passwordField = await page.$('#passwordInput');
  await passwordField.type(password)

  const loginButton = await page.$('#submitButton');
  await loginButton.click()

  await page.waitForNavigation();

  await page.waitForSelector('a[href="history.php"][aria-label="History"][class="tabletop_left"]');
  const element = await page.$('a[href="history.php"][aria-label="History"][class="tabletop_left"]');
  await element.click();

  await page.waitForNavigation();

  const data = await page.evaluate(() => {
    const table = document.getElementsByClassName('table table-striped table-bordered')[0];
    const rows = table.getElementsByTagName('tr');
    const data = [];

    for(const row of rows) {
      const rowData = {}
      const cells = row.getElementsByTagName('td');

      for(const cell of cells) {
        const cellData = cell.innerHTML;
        rowData[cell.className] = cellData;
      }

      data.push(rowData);
    }

    return data;
  });

  console.log(data);

  await browser.close();
}
