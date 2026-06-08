const terminal = document.getElementById("terminal");
const form = document.getElementById("commandForm");
const input = document.getElementById("cmd");
const promptEl = document.getElementById("prompt");
let cwd = "C:";
let soundOn = true;

const state = {
  missionsDone: new Set(),
  achievements: new Set(),
  flags: {
    readWelcome:false, readKlein:false, ranMemory:false, foundHidden:false,
    repairedBoot:false, decodedNote:false, enteredArchive:false, ranDream:false,
    readMother:false, backedUp:false, unlockedVault:false, final:false
  }
};

const fs = {
  "C:": {
    type:"dir",
    items:{
      "README.TXT": {type:"file", text:`KLEIN SHELL DOS 2.0 - PREVIEW BUILD

Welcome, operator.

This computer was found inside an old technical workshop.
The machine boots, but its owner left strange logs, locked folders
and recovery tools hidden across the system.

Type HELP to begin.
Type MISSIONS to see your objectives.

Important commands:
DIR, TREE, CD, TYPE, RUN, COPY, DEL, CLS, MEM, VER, DATE, TIME, MISSIONS, ACHIEVEMENTS, THEME, DECODE, SCAN, FIXBOOT, BACKUP, ABOUT`},
      "KLEIN.TXT": {type:"file", text:`Rodrigo Klein Mariano Canto
Technician, dreamer, builder.

This system is a tribute to curiosity:
the kind that makes someone read manuals,
test strange ideas, repair old machines,
and refuse to give up before understanding the logic.

"Different, honest, nostalgic."`},
      "AUTOEXEC.BAT": {type:"file", text:`@ECHO OFF
PROMPT $P$G
PATH=C:\\DOS;C:\\TOOLS;C:\\GAMES
REM If the system freezes, check C:\\DOS\\BOOTLOG.TXT`},
      "DOS": {type:"dir", items:{
        "BOOTLOG.TXT": {type:"file", text:`BOOT LOG - 1998/10/16

COMMAND.COM found.
HIMEM.SYS found.
MOUSE.COM missing.
KLEIN.SYS corrupted.

Warning: system memory map changed after midnight.
Suggested action: RUN MEMTEST.EXE, then FIXBOOT.`},
        "MEMTEST.EXE": {type:"program", run:()=>{state.flags.ranMemory=true; unlock("Memory Hunter"); return `Memory test started...

Base memory:       640K OK
Extended memory:  65536K OK
Shadow memory:    unstable sector found
Recommendation: run FIXBOOT from C:\\DOS`;}},
        "FIXBOOT.EXE": {type:"program", run:()=>`This tool cannot run directly.
Use command: FIXBOOT`}
      }},
      "TOOLS": {type:"dir", items:{
        "README.TXT": {type:"file", text:`TOOLS DIRECTORY

SCAN        Searches for hidden traces.
DECODE      Decodes old notes.
BACKUP      Copies important logs to C:\\BACKUP.
FIXBOOT     Repairs simulated boot records.`},
        "NOTE.KDN": {type:"file", text:`Encoded note:
Uifsf jt b tfdsfu jo uif BSDIJWF.
Uif wbvmu lofxt uif obnf: LMFJO`},
        "DREAM.EXE": {type:"program", run:()=>{state.flags.ranDream=true; unlock("Dream Runner"); return `Klein Dream module loaded.

A social network can be more than a feed.
It can be a room, a memory, a little home on the internet.

New directory discovered: C:\\DREAM`;}}
      }},
      "GAMES": {type:"dir", items:{
        "PAYNT.EXE": {type:"program", run:()=>`Paynt module preview:
[ Pencil ] [ Brush ] [ Spray ] [ Shapes ] [ Save ]

This is only an echo from another Klein project.`},
        "AUAU.EXE": {type:"program", run:()=>`Auau says: WOOF!
Happiness +5
Nostalgia +10`}
      }},
      "ARCHIVE": {type:"dir", hidden:true, locked:false, items:{
        "OLD_PC.LOG": {type:"file", text:`OLD PC LOG

386 -> 486 -> Pentium -> notebooks -> projects -> Klein Dream.

Every machine teaches something.
Every error message is a door.`},
        "MOTHER.TXT": {type:"file", text:`DEDICATION

To the mother who taught that we should be inspired by good people,
not by bad examples.

This file is protected as emotional memory.`},
        "VAULT.KEY": {type:"file", text:`VAULT KEY FRAGMENT:
KLEIN-1998-DREAM`}
      }},
      "DREAM": {type:"dir", hidden:true, items:{
        "NETWORK.TXT": {type:"file", text:`KLEIN DREAM NETWORK

No algorithmic feed.
No pressure.
More profile, more memory, more affection for the old internet.`},
        "USERS.LOG": {type:"file", text:`Initial dreamers detected.
Growth is slow, but honest.`}
      }},
      "BACKUP": {type:"dir", hidden:true, items:{}},
      "VAULT": {type:"dir", hidden:true, locked:true, items:{
        "FINAL.TXT": {type:"file", text:`FINAL MESSAGE

You did not just use commands.
You investigated a machine.

Klein Shell DOS 2.0 is no longer only a prompt.
It is a retro adventure.

Preview completed.
More missions can be added from this base.`}
      }}
    }
  }
};

const missionList = [
  ["Read README.TXT", ()=>state.flags.readWelcome],
  ["Read KLEIN.TXT", ()=>state.flags.readKlein],
  ["Run memory test in C:\\DOS", ()=>state.flags.ranMemory],
  ["Repair boot using FIXBOOT", ()=>state.flags.repairedBoot],
  ["Scan for hidden directories", ()=>state.flags.foundHidden],
  ["Decode NOTE.KDN in C:\\TOOLS", ()=>state.flags.decodedNote],
  ["Enter C:\\ARCHIVE", ()=>state.flags.enteredArchive],
  ["Read MOTHER.TXT", ()=>state.flags.readMother],
  ["Run DREAM.EXE", ()=>state.flags.ranDream],
  ["Create backup using BACKUP", ()=>state.flags.backedUp],
  ["Unlock C:\\VAULT", ()=>state.flags.unlockedVault],
  ["Read FINAL.TXT", ()=>state.flags.final]
];

function currentDir(){
  const parts = cwd.split("\\").filter(Boolean);
  let node = fs[parts[0]];
  for(let i=1;i<parts.length;i++) node = node.items[parts[i]];
  return node;
}
function pathOf(name){
  name = name.toUpperCase();
  if(name === ".") return currentDir();
  if(name === "..") return null;
  return currentDir().items[name];
}
function print(txt="", cls="sys"){
  const div=document.createElement("div"); div.className=`line ${cls}`; div.textContent=txt; terminal.appendChild(div); terminal.scrollTop=terminal.scrollHeight;
}
function unlock(name){ if(!state.achievements.has(name)){ state.achievements.add(name); print(`Achievement unlocked: ${name}`,"ok"); beep(); } }
function beep(){
  if(!soundOn) return;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator(); const gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value=660; gain.gain.value=.035; osc.start();
    setTimeout(()=>{osc.stop(); ctx.close();},55);
  }catch(e){}
}
function setPrompt(){ promptEl.textContent = cwd + ">"; }

function checkMissions(){
  missionList.forEach(([name,done],i)=>{ if(done() && !state.missionsDone.has(i)){ state.missionsDone.add(i); print(`Mission complete: ${name}`,"ok"); beep(); }});
}

const commands = {
  HELP(){
    return `Commands available:

HELP              Shows this help
DIR               Lists files and folders
DIR /A            Lists files including hidden
TREE              Shows directory tree
CD folder         Enters folder
CD..              Goes back
CD\\              Goes to C:\\
TYPE file         Reads text file
RUN program       Runs a program
SCAN              Finds hidden directories
DECODE file       Decodes simple encrypted notes
FIXBOOT           Repairs simulated boot sector
BACKUP            Backs up important logs
MISSIONS          Shows objectives
ACHIEVEMENTS      Shows achievements
CLS               Clears screen
VER, MEM, DATE, TIME
THEME GREEN/AMBER/BLUE
ABOUT`;
  },
  DIR(args){
    const showHidden = args[0] === "/A";
    const items = Object.entries(currentDir().items).filter(([k,v])=>showHidden || !v.hidden);
    if(!items.length) return "No files found.";
    return items.map(([k,v])=>{
      const tag = v.type==="dir" ? "<DIR>" : "     ";
      const hid = v.hidden ? " [hidden]" : "";
      const lock = v.locked ? " [locked]" : "";
      return `${tag} ${k}${hid}${lock}`;
    }).join("\n");
  },
  TREE(){
    const walk=(node,prefix="")=>{
      let out=[];
      for(const [k,v] of Object.entries(node.items)){
        if(v.hidden) continue;
        out.push(prefix+k+(v.type==="dir"?"\\":""));
        if(v.type==="dir") out=out.concat(walk(v,prefix+"  "));
      }
      return out;
    };
    return "C:\\\n"+walk(fs["C:"],"  ").join("\n");
  },
  CD(args){
    let target = args.join(" ").toUpperCase();
    if(!target) return cwd;
    if(target==="\\"){cwd="C:"; setPrompt(); return "";}
    if(target===".." || target==="CD.."){
      const parts=cwd.split("\\"); if(parts.length>1){parts.pop(); cwd=parts.join("\\");} setPrompt(); return "";
    }
    target = target.replace(/^C:\\?/,"");
    let node = currentDir().items[target];
    if(!node || node.type!=="dir" || node.hidden && target!=="ARCHIVE" && target!=="DREAM" && target!=="VAULT") return "Invalid directory.";
    if(node.locked) return "Access denied. This directory is locked.";
    cwd = cwd==="C:" ? `C:\\${target}` : `${cwd}\\${target}`;
    if(target==="ARCHIVE") state.flags.enteredArchive=true;
    setPrompt(); return "";
  },
  TYPE(args){
    const name=args.join(" ").toUpperCase();
    const f=pathOf(name);
    if(!f || f.type!=="file") return "File not found.";
    if(name==="README.TXT" && cwd==="C:") state.flags.readWelcome=true;
    if(name==="KLEIN.TXT" && cwd==="C:") state.flags.readKlein=true;
    if(name==="MOTHER.TXT") state.flags.readMother=true;
    if(name==="FINAL.TXT") state.flags.final=true;
    return f.text;
  },
  RUN(args){
    const name=args.join(" ").toUpperCase();
    const f=pathOf(name);
    if(!f || f.type!=="program") return "Program not found.";
    return f.run();
  },
  SCAN(){
    state.flags.foundHidden=true;
    fs["C:"].items.ARCHIVE.hidden=false;
    fs["C:"].items.BACKUP.hidden=false;
    if(state.flags.ranDream) fs["C:"].items.DREAM.hidden=false;
    unlock("Hidden Seeker");
    return `Scan complete.

Hidden directories revealed:
C:\\ARCHIVE
C:\\BACKUP` + (state.flags.ranDream ? "\nC:\\DREAM" : "\nTip: run DREAM.EXE inside C:\\TOOLS later.");
  },
  DECODE(args){
    const name=args.join(" ").toUpperCase();
    if(name!=="NOTE.KDN") return "Decode target not recognized.";
    if(cwd!=="C:\\TOOLS") return "NOTE.KDN is not in this directory.";
    state.flags.decodedNote=true;
    return `Decoded note:
There is a secret in the ARCHIVE.
The vault knows the name: KLEIN`;
  },
  FIXBOOT(){
    if(!state.flags.ranMemory) return "Run MEMTEST.EXE before repairing boot.";
    state.flags.repairedBoot=true;
    unlock("Boot Doctor");
    return `Boot sector repaired.
KLEIN.SYS restored.
System stability improved.`;
  },
  BACKUP(){
    if(!state.flags.enteredArchive) return "Backup source not found. Explore C:\\ARCHIVE first.";
    fs["C:"].items.BACKUP.items["ARCHIVE_BAK.LOG"] = {type:"file", text:"Backup created from OLD_PC.LOG and MOTHER.TXT"};
    state.flags.backedUp=true; unlock("Backup Soul");
    return "Backup complete: C:\\BACKUP\\ARCHIVE_BAK.LOG";
  },
  MISSIONS(){
    return missionList.map(([name,done],i)=>`${String(i+1).padStart(2,"0")}. [${done()?"X":" "}] ${name}`).join("\n");
  },
  ACHIEVEMENTS(){
    return state.achievements.size ? [...state.achievements].map(a=>"- "+a).join("\n") : "No achievements yet.";
  },
  VER(){ return "Klein Shell DOS 2.0 Preview Build - 2026"; },
  MEM(){ return "655360 bytes conventional memory\n67108864 bytes extended memory\nMemory nostalgia: HIGH"; },
  DATE(){ return new Date().toLocaleDateString(); },
  TIME(){ return new Date().toLocaleTimeString(); },
  CLS(){ terminal.innerHTML=""; return ""; },
  ABOUT(){ return `Klein Shell DOS 2.0 Preview

A retro terminal adventure created by Rodrigo Klein Mariano Canto
with Lolita / ChatGPT assistance.

This build is free to test, expand and publish as an online preview.`; },
  THEME(args){
    const t=(args[0]||"").toLowerCase();
    document.body.classList.remove("amber","blue");
    if(t==="amber") document.body.classList.add("amber");
    else if(t==="blue") document.body.classList.add("blue");
    else if(t!=="green") return "Use: THEME GREEN, THEME AMBER or THEME BLUE";
    return `Theme changed to ${t.toUpperCase()||"GREEN"}.`;
  },
  UNLOCK(args){
    const key=args.join(" ").toUpperCase();
    if(key==="KLEIN-1998-DREAM" || key==="KLEIN"){
      fs["C:"].items.VAULT.hidden=false; fs["C:"].items.VAULT.locked=false; state.flags.unlockedVault=true; unlock("Vault Opener");
      return "C:\\VAULT unlocked.";
    }
    return "Invalid key.";
  }
};

function process(raw){
  const line=raw.trim();
  if(!line) return;
  print(promptEl.textContent+" "+line,"cmdline");
  const normalized=line.replace(/^CD\.\.$/i,"CD ..").replace(/^CD\\$/i,"CD \\");
  const parts=normalized.split(/\s+/);
  const cmd=parts[0].toUpperCase();
  const args=parts.slice(1).map(x=>x.toUpperCase());
  let out;
  if(commands[cmd]) out=commands[cmd](args);
  else out="Bad command or file name.";
  if(out) print(out);
  checkMissions();
}

form.addEventListener("submit", e=>{e.preventDefault(); const v=input.value; input.value=""; process(v);});
document.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>process("THEME "+b.dataset.theme));
document.getElementById("soundBtn").onclick=()=>{soundOn=!soundOn; document.getElementById("soundBtn").textContent="SOUND: "+(soundOn?"ON":"OFF"); input.focus();};

print("Klein Shell DOS 2.0 Preview");
print("Type HELP to begin. Type MISSIONS to see the new progression system.");
print("");
setPrompt();
input.focus();
