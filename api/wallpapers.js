import { createCanvas } from "@napi-rs/canvas"

export default function handler(req, res) {

const width = parseInt(req.query.width) || 1290
const height = parseInt(req.query.height) || 2796

const canvas = createCanvas(width,height)
const ctx = canvas.getContext("2d")

const W = width
const H = height

// background
ctx.fillStyle="#0f0f0f"
ctx.fillRect(0,0,W,H)

const today=new Date()
const year=today.getFullYear()

// holidays
const holidaySet=new Set([
"2026-01-02","2026-01-03","2026-01-04","2026-01-10","2026-01-11","2026-01-17","2026-01-18","2026-01-25","2026-01-31",
"2026-02-01","2026-02-07","2026-02-08","2026-02-14","2026-02-15","2026-02-22","2026-02-28",
"2026-03-01","2026-03-03","2026-03-07","2026-03-08","2026-03-14","2026-03-15","2026-03-21","2026-03-22","2026-03-28","2026-03-29",
"2026-04-05","2026-04-11","2026-04-12","2026-04-13","2026-04-14","2026-04-15","2026-04-19","2026-04-25","2026-04-26",
"2026-05-01","2026-05-02","2026-05-03","2026-05-09","2026-05-10","2026-05-16","2026-05-17","2026-05-23","2026-05-24","2026-05-30","2026-05-31",
"2026-06-06","2026-06-07","2026-06-13","2026-06-14","2026-06-20","2026-06-21","2026-06-28",
"2026-07-05","2026-07-11","2026-07-12","2026-07-19","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30",
"2026-08-01","2026-08-02","2026-08-08","2026-08-09","2026-08-12","2026-08-15","2026-08-16","2026-08-22","2026-08-23","2026-08-29","2026-08-30",
"2026-09-05","2026-09-06","2026-09-12","2026-09-13","2026-09-19","2026-09-20","2026-09-26","2026-09-27",
"2026-10-03","2026-10-04","2026-10-10","2026-10-11","2026-10-12","2026-10-13","2026-10-18","2026-10-23","2026-10-24","2026-10-25","2026-10-31",
"2026-11-01","2026-11-07","2026-11-08","2026-11-14","2026-11-15","2026-11-21","2026-11-22","2026-11-24","2026-11-29",
"2026-12-05","2026-12-06","2026-12-12","2026-12-13","2026-12-19","2026-12-20","2026-12-26","2026-12-27","2026-12-28","2026-12-29","2026-12-30","2026-12-31"
])

// helpers
const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
const same=(a,b)=>a.toDateString()==b.toDateString()
const leap=y=>(y%4==0&&y%100!=0)||y%400==0
const doy=d=>Math.floor((d-new Date(d.getFullYear(),0,0))/86400000)

// layout
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const cols=3
const rows=4
const gap=30
const r=10

const gridH=1200
const monthW=gap*(7+2)
const gridW=monthW*cols

const startX=(W-gridW)/2+40
const startY=380

const monthX=gridW/cols
const monthY=gridH/rows

ctx.font="32px sans-serif"

// calendar
for(let m=0;m<12;m++){

let col=m%cols
let row=Math.floor(m/cols)

let mx=startX+col*monthX
let my=startY+row*monthY

ctx.fillStyle="#9a9a9a"
ctx.fillText(months[m],mx-10,my-30)

let first=new Date(year,m,1).getDay()
let days=new Date(year,m+1,0).getDate()

for(let d=1;d<=days;d++){

let date=new Date(year,m,d)
let i=first+d-1

let x=mx+(i%7)*gap
let y=my+Math.floor(i/7)*gap

let holiday=holidaySet.has(fmt(date))
let w=date.getDay()

let color=
same(date,today) ? "#ff7a3c" :
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
ctx.fillStyle="#ff7a3c"
ctx.font="40px sans-serif"

ctx.fillText(`${left}d · ${percent}%`,W/2,startY+gridH+110)

// output
res.setHeader("Content-Type","image/png")
res.send(canvas.toBuffer("image/png"))

}
