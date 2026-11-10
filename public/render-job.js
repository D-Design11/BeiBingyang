(async () => {
  const token = new URLSearchParams(location.search).get('token');
  if (!token) {document.querySelector('#status').textContent = '请使用 npm run render 启动批量出图。'; return;}
  const endpoint = '/__job/' + encodeURIComponent(token);
  let result;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('无法读取出图任务');
    const brief = await response.json();
    await DidiLayout.ready;
    if (!DidiLayout.fontsReady) throw new Error('品牌字体加载失败，已停止出图');
    const visual = DidiLayout.asset(brief.visualAssetId);
    if (!visual) throw new Error('主视觉不存在：' + brief.visualAssetId);
    const data = {title: brief.title, subtitle: brief.subtitle, customImage: visual.file, url: '', date: '', location: ''};
    const materials = brief.materials.map(m => {
      const input = {...data, splitPreset: m.template, brandPillar: m.brandPillar || 'horizontal'};
      const size = {label: m.label || m.id, w: m.w, h: m.h};
      return {id:m.id, input, size, plan:DidiLayout.plan(input,size)};
    });
    result = {ok:materials.every(m=>m.plan.valid), ruleVersion:DidiLayout.config.version, measurementMode:'actual-font', materials:materials.map(m=>({id:m.id,size:m.size,plan:m.plan}))};
    if (result.ok) {
      result.images = [];
      for (const m of materials) {
        const bytes = await DidiLayout.exportPng(m.input,m.size);
        let binary = '';
        for (let i=0; i<bytes.length; i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
        result.images.push({id:m.id, png:btoa(binary)});
      }
    }
  } catch (error) {result = {ok:false,error:error.message};}
  await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result)});
  document.querySelector('#status').textContent = result.ok ? '出图完成' : '出图失败，请查看报告';
})();
