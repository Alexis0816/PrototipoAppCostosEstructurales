export default async function run(page, ui) {
  const paso1 = await ui.snapshot();
  const ingresar = paso1.match(/@(e\d+) button "INGRESAR"/)?.[1];
  if (!ingresar) return { error: 'no INGRESAR', paso1 };
  await ui.click(ingresar);
  await page.waitForTimeout(1200);

  const paso2 = await ui.snapshot();
  const detectar = paso2.match(/@(e\d+) button "Detectando rol/)?.[1];
  if (detectar) {
    await ui.click(detectar);
    await page.waitForTimeout(1200);
  }

  const lista = await ui.snapshot();
  const gerencias = lista.match(/@(e\d+) button "Gerencias"/)?.[1];
  if (!gerencias) return { error: 'no Gerencias', lista };
  await ui.click(gerencias);
  await page.waitForTimeout(700);

  const gerList = await ui.snapshot();
  const verGer = gerList.match(/@(e\d+) button "(Ver|Editar)"/)?.[1];
  if (!verGer) return { error: 'no ver gerencia', gerList };
  await ui.click(verGer);
  await page.waitForTimeout(900);

  const info = await page.evaluate(() => {
    const header = document.querySelector('.mb-6.bg-navy-900');
    if (!header) return '(no header)';
    const rect = header.getBoundingClientRect();
    const firstRow = header.firstElementChild;
    const children = Array.from(firstRow.children).map((c) => {
      const r = c.getBoundingClientRect();
      return {
        text: c.textContent.replace(/\s+/g, ' ').trim(),
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
      };
    });
    return { headerWidth: Math.round(rect.width), children };
  });
  return { info };
}