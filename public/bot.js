// ==UserScript==
// @name         Sneknet v2: Eletric Boogaloo
// @namespace    https://sneknet.com/
// @version      0.1
// @description  try to take over the world!
// @author       Matthew Merrill <mattmerr.com>
// @match        https://www.reddit.com/sequence
// @grant        none
// ==/UserScript==

// Matthew Merrill <mattmerr.com>
async function getModHash() {
  let res = await fetch('/api/me.json');
  let json = await res.json();
  return json.data.modhash;
}

async function getTasks() {
  //let res = await fetch('http://localhost:4000/tasks');
  //return res.json();
  let res = await fetch('https://snake.egg.party/v1/targets');
  let json = await res.json();
  let tasks = [];
  for (let task of json.targets) {
    tasks.push(task.fullname);
  }
  return tasks;
}

async function sleep(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), delay);
  });
}

async function voteFor(id, modhash) {
  return fetch("https://www.reddit.com/api/sequence_vote.json", {
    "credentials":"include",
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "pragma":"no-cache",
      "x-modhash": modhash,
      "x-requested-with":"XMLHttpRequest"
    },
    "referrer":"https://www.reddit.com/",
    "referrerPolicy":"origin",
    "body": `id=${id}&direction=1&raw_json=1`,
    "method":"POST",
    "mode":"cors",
  });
}

async function go() {
  const modhash = await getModHash();
  let nextTaskIdx = 0;
  
  while (true) {
    try {
      console.log('fetching tasks...');
      let tasks = await getTasks();
      let tasksTodo = tasks.slice(nextTaskIdx);
      console.log('Items to do:', tasksTodo);
      if (tasksTodo.length === 0) {
        console.log('Nothing to do!');
      }
      else {
        for (let task of tasks.slice(nextTaskIdx)) {
          try {
            console.log('Voting for', task);
            let res = await voteFor(task, modhash);
            if (res.ok) {
              console.log('Voted for', task);
            }
            else {
              console.error('Response was not ok', res);
            }
            nextTaskIdx += 1;
          } catch (err) {
            console.error('Error sending fetch:', err);
            break;
          }
          await sleep(200);
        }
      }
    }
    catch (err) {
      broadcast('Error!', err);
    }
    await sleep(10000);
  }
}

function broadcast(msg) {
  document.body.innerHTML = `<h1 style="font-size: 4em">${msg}</h1>`;
  console.log.apply(console, arguments);
}
broadcast('Running Sequence Bot');

go()
  .then(val => broadcast('Finished:' + JSON.stringify(val)))
  .catch(err => broadcast('Error:' + JSON.stringify(err)));
