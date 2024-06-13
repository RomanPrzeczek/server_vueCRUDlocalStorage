"use strict";

// express consts
const express = require('express');
const cors = require('cors');
const app = express();

const fetch = require('node-fetch');

//dao consts, file system setup
const fs = require("fs");
const path = require("path");

const rf = fs.promises.readFile;

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "items.json");

const storageItemsLimit = 10;

const PORT = process.env.PORT || 8000;

let outputKurzy = 'iniServerOutput';

// Creating of Express application
app.use(cors());
app.use(express.json());

//Starting of server
app.listen(PORT, () => {console.log(`App listening on port ${PORT}!`); });

//GETTERS
// getting the items from storage
async function listItems() {
    let itemslist;
    try {
      itemslist = JSON.parse(await rf(DEFAULT_STORAGE_PATH));
      itemslist = itemslist.sort(function(a, b) {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA > nameB) {
            return -1;
        }
        if (nameA < nameB) {
            return 1;
        }          
        // names must be equal
        return 0;
        });
    } catch (e) {
        console.log("Error read items stream > "+e)
    }
    return itemslist
};

//ENDPOINTS
// creating endpoint for server communication res/req
async function ListAbl(req, res) {
    try {
      const items = await listItems();
      res.json(items);
    } catch (e) {
        console.log("Error ListAbl > "+e)
    }
};

// express hendler
app.get("/list", async (req, res) => {
    await ListAbl(req, res);
});

app.get('/limit', (req, res) => {
    res.json({ BElimit: storageItemsLimit });
});

app.get('/', (req, res) => {
    res.send(`App listening on port ${PORT}!`)
});

//let fetchedDate = '';
let output = {
    rate:'',
    date:''
};

function processFetch(input){
    let workArray = input.split(/\r?\n/);
    let data = '';
    workArray.forEach(element => {
        if (element.includes('EMU')){
            data=element;
        }
    });
    data=data.split("|");
    output.rate=(data[4]).replace(',','.');
    output.date=(workArray[0]).split(" ");
    output.date=(output.date)[0];
    console.log(`server / output: ${JSON.stringify(output)}`);
    //fetchedDate = output.date;
    return output.rate;
    //return output;
}


app.get('/cnb', async function(req,res) {
    if (getToday()!==output.date) {
        await fetch('https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt')
            .then((res) => res.text())
            .then((body) => {
                //console.log(body);
                res.send(processFetch(body))
            });
            output.date=getToday();
        }
    else {
        console.log("Today's rate already fetched.");
        res.send(output.rate)
        //res.send(output)
    }
});

function getToday(){
    let today = new Date();
    let options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    today=today.toLocaleDateString('en-gb', options);
    today=today.replaceAll('/','.');
    //console.log(`Today is: ${today.getDate()}.${today.getMonth()+1}.${today.getFullYear()} and its ${nameDay(today.getDay())}`);    
    return today;
};

app.get('/t',()=>{
    getToday();
});