/* QR byte-mode encoder, version 4 / level L. 78 UTF-8 bytes maximum. */
window.makeQR = function (value) {
  const data = Array.from(new TextEncoder().encode(value));
  if (data.length > 78) throw new Error('二维码链接请控制在 78 字节内');
  const bits = [];
  const put = (v, n) => { for (let i=n-1;i>=0;i--) bits.push((v>>>i)&1); };
  put(4,4); put(data.length,8); data.forEach(v=>put(v,8));
  put(0,Math.min(4,640-bits.length));
  while(bits.length%8) bits.push(0);
  const words=[];
  for(let i=0;i<bits.length;i+=8) words.push(bits.slice(i,i+8).reduce((a,b)=>(a<<1)|b,0));
  for(let i=0;words.length<80;i++) words.push(i%2?0x11:0xec);
  const mul=(a,b)=>{let r=0;for(let i=7;i>=0;i--){r=(r<<1)^((r>>>7)*0x11d);r^=((b>>>i)&1)*a;}return r;};
  const divisor=new Array(20).fill(0);divisor[19]=1;
  let root=1;
  for(let i=0;i<20;i++){for(let j=0;j<20;j++){divisor[j]=mul(divisor[j],root);if(j+1<20)divisor[j]^=divisor[j+1];}root=mul(root,2);}
  const ecc=new Array(20).fill(0);
  for(const b of words){const factor=b^ecc.shift();ecc.push(0);for(let i=0;i<20;i++)ecc[i]^=mul(divisor[i],factor);}
  const stream=[];[...words,...ecc].forEach(b=>{for(let i=7;i>=0;i--)stream.push((b>>>i)&1);});
  const n=33,m=Array.from({length:n},()=>Array(n).fill(false)),reserved=Array.from({length:n},()=>Array(n).fill(false));
  const set=(x,y,v)=>{if(x>=0&&y>=0&&x<n&&y<n){m[y][x]=!!v;reserved[y][x]=true;}};
  for(let i=0;i<n;i++){set(6,i,i%2===0);set(i,6,i%2===0);}
  for(const [cx,cy] of [[3,3],[29,3],[3,29]]) for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!==2&&d!==4);}
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(26+dx,26+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
  let fmt=8,rem=fmt;for(let i=0;i<10;i++)rem=(rem<<1)^((rem>>>9)*0x537);fmt=((fmt<<10)|rem)^0x5412;
  const b=i=>((fmt>>>i)&1)!==0;
  for(let i=0;i<=5;i++)set(8,i,b(i));set(8,7,b(6));set(8,8,b(7));set(7,8,b(8));
  for(let i=9;i<15;i++)set(14-i,8,b(i));
  for(let i=0;i<8;i++)set(n-1-i,8,b(i));for(let i=8;i<15;i++)set(8,n-15+i,b(i));set(8,n-8,true);
  let p=0,up=true;
  for(let right=n-1;right>=1;right-=2){if(right===6)right--;for(let v=0;v<n;v++){const y=up?n-1-v:v;for(let j=0;j<2;j++){const x=right-j;if(!reserved[y][x]){m[y][x]=!!(stream[p++]||0);if((x+y)%2===0)m[y][x]=!m[y][x];}}}up=!up;}
  return m;
};
