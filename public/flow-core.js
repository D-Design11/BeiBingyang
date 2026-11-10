/* Demo domain state. No AI or approval service is connected. */
(function(root){
  const clone=v=>JSON.parse(JSON.stringify(v));
  const SAMPLE='我要为杭州周末活动制作朋友圈海报和线下展架，风格年轻、有活力。';
  const VISUALS=[
    {id:'mood',name:'轻松出发 · 人物主视觉',file:'assets/visuals/travel-mood.png',description:'轻松出行 · 本地生活 / 城市活动',note:'用户提供 · 已导入',reason:'轻松的人物与橙色出行场景，适合日常生活与城市活动主题。'},
    {id:'surprise',name:'每一程 都有惊喜',file:'assets/visuals/travel-surprise.png',description:'周末假日 · 活动福利 / 休闲出行',note:'用户提供 · 已导入',reason:'假日出游的人物与行李箱画面，适合周末活动与出行福利传播。'},
    {id:'departure',name:'向美好 即刻出发',file:'assets/visuals/travel-departure.png',description:'周末出行 · 城市活动 / 轻松旅程',note:'用户提供 · 已导入',reason:'人物、出行路径与橙色车辆形成统一画面，适合年轻、有活力的周末活动。'},
    {id:'encounter',name:'赴一场城市新遇',file:'assets/visuals/travel-encounter.png',description:'城市探索 · 本地活动 / 城市新体验',note:'用户提供 · 已导入',reason:'城市探索的人物场景，适合发现城市与本地新体验的主题。'}
  ];
  const LEGACY_VISUALS=[
    {id:'weekend',name:'周末，向城市出发',file:'assets/visuals/hangzhou-weekend.svg'},
    {id:'ginkgo',name:'金秋银杏映古建',file:'assets/visuals/ginkgo-architecture.png'}
  ];
  const getVisual=id=>VISUALS.find(v=>v.id===id)||LEGACY_VISUALS.find(v=>v.id===id);
  const recommendVisual=text=>/惊喜|假日|行李/.test(text)?'surprise':/新遇|探索|新体验/.test(text)?'encounter':/心情|轻松生活/.test(text)?'mood':'departure';
  const MATERIALS=[
    {id:'social',name:'朋友圈海报',w:1080,h:1440,unit:'px',template:'M',brandPillar:'horizontal',qty:1,description:'3:4 · 便于手机阅读与转发'},
    {id:'stand',name:'线下展架',w:800,h:1800,unit:'mm',template:'M',brandPillar:'horizontal',qty:1,description:'80 × 180 cm · 线下活动引导'},
    {id:'landscape',name:'横版海报',w:594,h:420,unit:'mm',template:'M',brandPillar:'horizontal',qty:1,description:'A2 横版 · 城市活动展示'}
  ];
  const PRESETS=[{id:'S',name:'画面优先',ratio:'文字 1 : 图片 2',fraction:1/3,reason:'适合突出主视觉，搭配简短信息。'},{id:'M',name:'图文平衡',ratio:'文字 1 : 图片 1',fraction:.5,reason:'适合同时突出主视觉与活动信息。'},{id:'L',name:'信息优先',ratio:'文字 2 : 图片 1',fraction:2/3,reason:'适合需要更多活动说明的内容。'},{id:'XL',name:'全画面',ratio:'整图叠加文字',fraction:0,reason:'适合保留完整画面，叠加精简文案。'}];
  const CASES=[{
    id:'hangzhou-weekend',title:'杭州春季营销',city:'杭州',topic:'春季营销',featured:true,visualId:'departure',
    brief:'为杭州春季营销活动制作朋友圈海报、横版宣传图和线下展架，用同一套主视觉呈现出行福利与轻松旅程。',
    note:'用户提供的主视觉与指定文案，按预置模板展示三个物料规格。',
    project:{business:'city',city:'杭州',style:'年轻、有活力',visualId:'departure',customImage:null,
      content:{name:'杭州春季营销',title:'向美好\u00a0 即刻出发',subtitle:'滴滴打车福利\u00a0 开启惬意旅程',url:''},
      materials:[
        {id:'case-social',name:'朋友圈海报',w:1080,h:1440,unit:'px',qty:1,template:'M',brandPillar:'horizontal'},
        {id:'case-landscape',name:'横版宣传图',w:1920,h:1080,unit:'px',qty:1,template:'M',brandPillar:'horizontal'},
        {id:'case-stand',name:'线下展架',w:800,h:1800,unit:'mm',qty:1,template:'M',brandPillar:'horizontal'}
      ]
    }
  },
  {id:'jinan-marathon',title:'济南泉城马拉松',city:'济南',topic:'城市赛事',featured:true,kind:'cover',visualId:'encounter'},
  {id:'wuhan-cherry',title:'武汉樱花节',city:'武汉',topic:'季节活动',featured:true,kind:'cover',visualId:'surprise'}
  ];
  const COPY={name:'杭州周末出行活动',title:'周末出发杭州见',subtitle:'把周末交给风景，让出行更轻松'};
  function create(entry='manual',brief=''){
    return {id:'CS-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5),entry,brief,business:'city',city:'杭州',style:'年轻、有活力',visualId:'departure',customImage:null,materials:clone(MATERIALS.slice(0,2)),content:{name:'',title:'',subtitle:'',url:''},stage:entry==='manual'?1:2,planConfirmed:false,workRevision:1,generatedRevision:0,snapshot:null,status:'draft',humanConfirmed:false,checkedTargets:[],submittedRevision:null,approvedRevision:null,reviewReason:'',history:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  }
  function parseBrief(text){
    const p=create('ai',String(text||'').trim());if(!p.brief)throw new Error('请先描述你想制作的物料。');
    p.business=/司机|车主/.test(text)?'driver':'city';
    p.city=(text.match(/杭州|上海|北京|深圳|广州|成都|南京|苏州|武汉/)||[''])[0];
    p.style=/年轻|活力/.test(text)?'年轻、有活力':/简洁|高级/.test(text)?'简洁、克制':/秋|银杏/.test(text)?'温暖、自然':'';
    p.visualId=recommendVisual(text);
    const found=[];if(/朋友圈|社交|手机|海报/.test(text))found.push(clone(MATERIALS[0]));if(/展架|易拉宝|地推/.test(text))found.push(clone(MATERIALS[1]));if(/横版|横幅/.test(text))found.push(clone(MATERIALS[2]));p.materials=found;
    p.inference={visualId:p.visualId,business:p.business==='city'?'根据出行活动与宣传物料描述，建议归入城市运营。':'识别到司机相关需求，该分支暂未定义完整模板。',visual:VISUALS.find(v=>v.id===p.visualId).reason,materials:found.length?'根据你提到的物料整理，尺寸为可修改的常用演示规格。':'尚未识别物料类型，请在下方明确选择。',template:'默认推荐 M 图文平衡；每个物料可独立调整比例与品牌识别排列。'};
    return p;
  }
  const data=p=>({business:p.business,city:p.city,style:p.style,visualId:p.visualId,customImage:p.customImage,materials:p.materials,content:p.content});
  const fingerprint=p=>JSON.stringify(data(p));
  const stale=p=>!!p.snapshot&&p.generatedRevision!==p.workRevision;
  function edit(p,mutate){
    if(p.status==='review')throw new Error('当前版本正在审核，请先撤回再修改。');
    const before=fingerprint(p);mutate(p);if(fingerprint(p)===before)return false;
    p.workRevision++;p.humanConfirmed=false;p.checkedTargets=[];p.approvedRevision=null;
    if(['approved','delivered'].includes(p.status))p.status='draft';
    p.updatedAt=new Date().toISOString();return true;
  }
  function planIssues(p){const a=[];if(p.business!=='city')a.push('司机端体验尚未配置完整流程。');if(!p.city.trim())a.push('请选择活动城市。');if(!p.materials.length)a.push('至少选择一种目标物料。');
    if(!p.customImage&&!getVisual(p.visualId))a.push('请选择或上传主视觉。');
    for(const s of p.materials){if(!PRESETS.some(t=>t.id===s.template))a.push(s.name+'：请选择模板。');if(!s.name.trim()||!Number.isFinite(s.w)||!Number.isFinite(s.h)||s.w<50||s.h<50||s.w>3000||s.h>3000||s.w/s.h<.25||s.w/s.h>5)a.push(s.name+'：尺寸须在 50—3000 范围内，宽高比 0.25—5。');if(!Number.isInteger(s.qty)||s.qty<1||s.qty>10000)a.push(s.name+'：份数须为 1—10000 的整数。');}
    if(p.materials.length>6)a.push('演示版最多选择 6 个规格。');return a;
  }
  function contentIssues(p){const a=[];if(!p.content.name.trim())a.push('请填写活动名称。');if(!p.content.title.trim())a.push('请填写主标题。');if(!p.content.subtitle.trim())a.push('请填写副标题。');if(p.content.url){try{const u=new URL(p.content.url);if(!['http:','https:'].includes(u.protocol)||new TextEncoder().encode(p.content.url).length>78)throw 0;}catch{a.push('二维码请使用 78 字节以内的 HTTP(S) 链接，或留空。');}}return a;}
  function confirmPlan(p){const errors=planIssues(p);if(errors.length)throw new Error(errors[0]);p.planConfirmed=true;p.stage=3;return p;}
  function renderInput(p){return {title:p.content.title,subtitle:p.content.subtitle,date:'',location:'',url:p.content.url,customImage:p.customImage||getVisual(p.visualId)?.file,splitPreset:'M',brandPillar:'horizontal',brand:{qrMin:20},sizes:p.materials.map(s=>({label:s.name,...s}))};}
  function generate(p,inspect){if(!p.planConfirmed)throw new Error('请先确认需求与方案。');const errors=[...planIssues(p),...contentIssues(p)];if(errors.length)throw new Error(errors[0]);const checks=inspect(p);if(checks.some(c=>c.kind==='system'&&!c.ok))throw new Error('系统检查发现问题，请先按建议调整。');
    p.snapshot=clone({...data(p),workRevision:p.workRevision,generatedAt:new Date().toISOString()});p.generatedRevision=p.workRevision;p.humanConfirmed=false;p.checkedTargets=[];p.stage=4;if(p.status!=='returned')p.status='draft';p.updatedAt=new Date().toISOString();return p;
  }
  function submit(p,inspect){if(!p.snapshot||stale(p))throw new Error('当前预览尚未更新，请重新生成后提交。');if(inspect(p).some(c=>c.kind==='system'&&!c.ok))throw new Error('请先解决系统检查问题。');if(!p.materials.every(s=>(p.checkedTargets||[]).includes(s.id)))throw new Error('请分别检查每个规格并标记确认。');if(!p.humanConfirmed)throw new Error('请逐规格确认活动文案、画面与二维码内容。');if(p.status==='review')throw new Error('当前版本已在审核中。');
    p.status='review';p.stage=5;p.submittedRevision=p.workRevision;p.approvedRevision=null;p.reviewReason='';p.history.push({type:'submitted',revision:p.workRevision,time:new Date().toISOString(),text:'运营已确认所有规格并提交市场审核。'});return p;
  }
  function review(p,approve,reason=''){if(p.status!=='review')throw new Error('仅能处理审核中的版本。');if(p.submittedRevision!==p.workRevision||stale(p))throw new Error('审核版本已变化，请重新提交。');if(!approve&&!reason.trim())throw new Error('请填写具体驳回原因。');p.status=approve?'approved':'returned';p.approvedRevision=approve?p.workRevision:null;p.reviewReason=reason.trim();if(!approve){p.humanConfirmed=false;p.checkedTargets=[];}p.history.push({type:p.status,revision:p.workRevision,time:new Date().toISOString(),text:reason.trim()||(approve?'市场审核通过（模拟）。':'')});return p;}
  function canDownload(p){return ['approved','delivered'].includes(p.status)&&!!p.snapshot&&!stale(p)&&p.approvedRevision===p.workRevision;}
  function delivered(p){if(!canDownload(p))throw new Error('审核通过且预览为当前版本后，才能下载。');p.status='delivered';p.history.push({type:'delivered',revision:p.workRevision,time:new Date().toISOString(),text:'评审样稿包已下载；非印前生产文件。'});return p;}
  function withdraw(p){if(p.status!=='review')throw new Error('当前没有审核中的版本。');p.status='draft';p.stage=4;p.humanConfirmed=false;p.submittedRevision=null;p.history.push({type:'withdrawn',revision:p.workRevision,time:new Date().toISOString(),text:'运营撤回以继续修改。'});}
  const api={SAMPLE,VISUALS,MATERIALS,PRESETS,COPY,CASES,getVisual,recommendVisual,clone,create,parseBrief,data,fingerprint,stale,edit,planIssues,contentIssues,confirmPlan,renderInput,generate,submit,review,canDownload,delivered,withdraw};root.StudioCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
