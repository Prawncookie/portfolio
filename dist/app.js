// Progressive enhancement only: all modules, notes and contact work without JS.
const tools = document.querySelector('.work-tools');
const filters = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('.project')];
if(tools && filters.length && projects.length) {
  tools.hidden=false;
  for(const button of filters) button.addEventListener('click',()=>{
    const filter=button.dataset.filter;
    for(const item of filters) item.setAttribute('aria-pressed',String(item===button));
    let count=0;
    for(const project of projects) {
      const visible=filter==='all'||project.dataset.category.split(' ').includes(filter);
      project.hidden=!visible;
      if(visible)count++;
    }
    const status=document.querySelector('#filter-status');
    status.textContent=`${count} project${count===1?'':'s'}`;
  });
}
const moduleTabs=document.querySelector('[data-system-tabs]');
const tabs=[...document.querySelectorAll('[data-module]')];
const panels=[...document.querySelectorAll('[data-system-panel]')];
if(moduleTabs && tabs.length && panels.length) {
  moduleTabs.hidden=false;
  moduleTabs.setAttribute('role','tablist');
  function selectModule(tab,focus=false) {
    for(const item of tabs) {
      const selected=item===tab;
      item.setAttribute('role','tab');
      item.setAttribute('aria-selected',String(selected));
      item.tabIndex=selected?0:-1;
    }
    for(const panel of panels) {
      panel.setAttribute('role','tabpanel');
      panel.tabIndex=0;
      panel.hidden=panel.dataset.systemPanel!==tab.dataset.module;
    }
    if(focus)tab.focus();
  }
  selectModule(tabs[0]);
  for(const tab of tabs) {
    tab.addEventListener('click',()=>selectModule(tab));
    tab.addEventListener('keydown',event=>{
      const index=tabs.indexOf(tab);
      const targets={ArrowRight:tabs[(index+1)%tabs.length],ArrowLeft:tabs[(index-1+tabs.length)%tabs.length],Home:tabs[0],End:tabs.at(-1)};
      if(targets[event.key]) {event.preventDefault();selectModule(targets[event.key],true);}
    });
  }
}
const copy=document.querySelector('.copy-email');
if(copy && navigator.clipboard?.writeText) {
  copy.hidden=false;
  copy.addEventListener('click',async()=>{
    try {
      await navigator.clipboard.writeText('basitshahab24904@gmail.com');
      document.querySelector('#copy-status').textContent='Email address copied.';
      copy.textContent='Copied ✓';
    } catch {
      document.querySelector('#copy-status').textContent='Copy is unavailable. Select the email address, or click it to open your email app.';
      copy.textContent='Select email to copy';
    }
  });
}
