// Calendar anniversaries preserve the chosen local clock time and clamp month ends.
(function(){
 const addMonths=(start,months)=>{
  const date=new Date(start);date.setDate(1);date.setMonth(date.getMonth()+months);
  const last=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();date.setDate(Math.min(start.getDate(),last));return date;
 };
 const milestones=(start,now)=>{
  if(!start||isNaN(start)||now<start)return [];
  const entries=[30,60,90].map(days=>{const date=new Date(start);date.setDate(date.getDate()+days);return {date,label:days+' ימים',id:'days-'+days,count:days,unit:'ימים',tone:days===30?'orange':days===60?'green':'red'};});
  for(const months of [6,9,12,18])entries.push({date:addMonths(start,months),label:months===12?'שנה':months+' חודשים',id:'months-'+months,count:months===12?1:months,unit:months===12?'שנה':'חודשים',tone:months===6?'blue':months===9?'yellow':months===12?'ivory':'gray'});
  for(let years=2;years<=now.getFullYear()-start.getFullYear()+1;years++)entries.push({date:addMonths(start,years*12),label:years+' שנים',id:'years-'+years,count:years,unit:'שנים',tone:'black'});
  return entries.filter(e=>e.date<=now).sort((a,b)=>a.date-b.date);
 };
 window.CleanTimeDates={addMonths,milestones};
})();
