
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import sqlite3 from "sqlite3"

dotenv.config()

const app=express()
app.use(cors())
app.use(express.json())

const db=new sqlite3.Database("database.db")

db.run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT,password TEXT)")

function auth(req,res,next){
const token=req.headers.authorization?.split(" ")[1]
if(!token) return res.status(401).json({error:"no token"})
try{
const decoded=jwt.verify(token,process.env.JWT_SECRET)
req.user=decoded
next()
}catch{
res.status(401).json({error:"invalid token"})
}
}

app.post("/api/register",async(req,res)=>{

const{email,password}=req.body
const hash=await bcrypt.hash(password,10)

db.run("INSERT INTO users(email,password) VALUES(?,?)",[email,hash])

res.json({message:"user created"})
})

app.post("/api/login",(req,res)=>{

const{email,password}=req.body

db.get("SELECT * FROM users WHERE email=?",[email],async(err,user)=>{

if(!user) return res.status(400).json({error:"user not found"})

const valid=await bcrypt.compare(password,user.password)

if(!valid) return res.status(400).json({error:"wrong password"})

const token=jwt.sign({id:user.id,email:user.email},process.env.JWT_SECRET)

res.json({token})

})

})

app.post("/api/generate",auth,(req,res)=>{

const{prompt}=req.body

res.json({
output:`AI Generated Content

Prompt: ${prompt}

Title: Powerful Digital Product
Description: This is generated SaaS content example.
Tags: ai, marketing, creator`
})

})

app.listen(4000,()=>{
console.log("API running on 4000")
})
