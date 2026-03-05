import { createCanvas, GlobalFonts } from "@napi-rs/canvas"
import path from "path"

if (!GlobalFonts.families.includes("Inter")) {
GlobalFonts.registerFromPath(
  path.join(process.cwd(), "fonts/Inter-Regular.otf"),
  "Inter"
)
}

export default async function handler(req, res) {

const width = parseInt(req.query.width) || 1290
const height = parseInt(req.query.height) || 2796

const canvas = createCanvas(width,height)
const ctx = canvas.getContext("2d")

const W = width
const H = height

// background
ctx.fillStyle="#0f0f0f"
ctx.fillRect(0,0,W,H)

// timezone ไทย
const today=new Date(Date.now()+7*60*60*1000)
const year=today.getFullYear()

// ===== โหลดวันหยุดจาก JSON =====
let holidaySet = new Set()

try{

const r = await fetch("https://opensheet.elk.sh/1PcO5Suopug9jvrLzB61NAKK10U_IIEOwPVe4HpVONfg/DayOff")
const json = await r.json()

holidaySet = new Set(json.map(d=>d.DayOff))

}catch(e){

console.log("holiday load fail",e)

}

// helpers
const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
const same=(a,b)=>a.toDateString()==b.toDateString()
const leap=y=>(y%4==0&&y%100!=0)||y%400==0
const doy=d=>Math.floor((d-new Date(d.getFullYear(),0,0))/86400000)

// layout
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const cols=3
const rows=4
const gap=35
const r=9

const gridH=1200
const monthW = gap * 8
const gridW=monthW*cols

const startX=(W-gridW)/2+41
const startY=1000

const monthX=gridW/cols
const monthY=gridH/rows

ctx.font="32px Inter"

// calendar
for(let m=0;m<12;m++){

let col=m%cols
let row=Math.floor(m/cols)

let mx=startX+col*monthX
let my=startY+row*monthY

ctx.save()
ctx.fillStyle="#9a9a9a"
ctx.fillText(months[m],mx-10,my-30)
ctx.restore()

let first=new Date(year,m,1).getDay()
let days=new Date(year,m+1,0).getDate()

for(let d=1;d<=days;d++){

let date=new Date(year,m,d)
let i=first+d-1

let x=Math.round(mx+(i%7)*gap)
let y=Math.round(my+Math.floor(i/7)*gap)

let holiday=holidaySet.has(fmt(date))
let w=date.getDay()

let color=
same(date,today) ? "#ffff00" :
holiday ? (date<today?"#ff3b3b":"#4a1f1f") :
(w==0||w==6) ? (date<today?"#bbbbbb":"#2a2a2a") :
(date<today?"#ffffff":"#3a3a3a")

ctx.beginPath()
ctx.arc(x,y,r,0,Math.PI*2)
ctx.fillStyle=color
ctx.fill()

}
}

// progress
const d=doy(today)
const total=leap(year)?366:365
const left=total-d
const percent=Math.floor(d/total*100)

ctx.textAlign="center"
ctx.textBaseline="middle"
ctx.fillStyle="#bbbbbb"
ctx.font="32px Inter"

ctx.fillText(`${left}d · ${percent}%`,W/2,startY+gridH-20)

// cache
res.setHeader("Cache-Control","public, max-age=3600")

// output
res.setHeader("Content-Type","image/png")
res.send(canvas.toBuffer("image/png"))

}
