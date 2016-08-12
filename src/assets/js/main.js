// Randomize glitching
function glitch() {
	var body = document.querySelector('body');
	var bodyClass = body.className;

	if(bodyClass.indexOf('no-glitch') <= -1) {
		body.className += ' no-glitch';
	} else {
		body.classList.remove('no-glitch');
	}
}

(function glitchLoop(){
	var rand = Math.round(Math.random() * 5000);
	setTimeout(function(){
		glitch();
		glitchLoop();
	}, rand);
}());

// Line up input caret
var inputs = document.querySelectorAll('input');
for(i = 0; i < inputs.length; i++) {
	inputs[i].addEventListener('input', function(){
		caret(this);
	});
}

function caret(input) {
	var val = input.value;
	var lbl = document.querySelector('[data-for='+input.getAttribute('id')+']');
	lbl.setAttribute('data-value', val);
}

// Interact with login form
var consoleForm = document.querySelector('.console');
var bash = document.querySelector('#console-bash');
var uname = document.querySelector('#console-uname');
var pass = document.querySelector('#console-pass');

document.addEventListener('keydown', function(e){
	if(e.keyCode == 27 && e.ctrlKey) {
		consoleForm.className += ' visible';
	}
});

bash.addEventListener('keydown', function(e){
	if(e.keyCode == '13') {
		e.preventDefault();
		var bashVal = bash.value;
		if(bashVal == 'login') {
			consoleForm.className += ' login-uname';
			uname.focus();
		} else {
			bash.value = 'Command not found';
			caret(bash);

			setTimeout(function(){
				bash.value = '';
				caret(bash);
			}, 2000);
		}
	}
});

uname.addEventListener('keydown', function(e){
	if(e.keyCode == '13') {
		e.preventDefault();
		consoleForm.classList.remove('login-uname');
		consoleForm.className += ' login-pass';
		pass.focus();
	}
});

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyADrNEqbp5PZ1m8BWGV6Pwg45_yGvMKEmQ',
  databaseURL: 'https://nms-log.firebaseio.com'
};

firebase.initializeApp(config);

// Get entries
var entries = firebase.database().ref('entries').orderByKey();
entries.on('value', function(snapshot){
	// Create an array of entries and sort
	var entries = snapshot.val();
	var entryArr = [];

	for(i in entries) {
		entryArr.push(entries[i]);
	}
	entryArr.reverse();

	// Empty log
	var entryLog = document.querySelector('.log');

	while(entryLog.hasChildNodes()) {
		entryLog.removeChild(entryLog.lastChild);
	}

	// Append entries
	for(i in entryArr) {
		var date = entryArr[i].date;
		var body = entryArr[i].body;
		entryLog.innerHTML += '<li><article class="entry"><h2 class="entry_stamp"><time class="hdg" pubdate>☉ '+convertDate(date)+'</time></h2><div class="entry_body body">'+body+'</div></article></li>';
	}

	// Set data-copy attribute (used for text glitching)
	var hdgArr = document.querySelectorAll('.hdg, .entry_body p, .entry_body li');

	for(i = 0; i < hdgArr.length; i++) {
		var glitchCopy = hdgArr[i].innerHTML;
		hdgArr[i].setAttribute('data-copy', glitchCopy)
	}

	// Wrap images (used for image glitching)
	var imgs = document.querySelectorAll('.entry img');

	for(var i = 0; i < imgs.length; i++) {
		var imgWrap = document.createElement('span');
		imgWrap.setAttribute('class', 'entry_img');

		var imgSrc = imgs[i].getAttribute('src');
		var before = document.createElement('img');
		var after = document.createElement('img');
		before.setAttribute('src', imgSrc)
		before.setAttribute('class', 'img-before');
		after.setAttribute('src', imgSrc)
		after.setAttribute('class', 'img-after');

		imgs[i].parentNode.insertBefore(imgWrap, imgs[i]);
		imgWrap.appendChild(before);
		imgWrap.appendChild(imgs[i]);
		imgWrap.appendChild(after);
	}
});

// Make sure user isn’t signed in on load
firebase.auth().signOut();

// Sign into Firebase
pass.addEventListener('keydown', function(e){
	if(e.keyCode == '13') {
		var email = uname.value;
		var password = pass.value;

		firebase.auth().signInWithEmailAndPassword(email, password);
	}
});

firebase.auth().onAuthStateChanged(function(user) {
	var body = document.querySelector('body');

  if (user) {
    body.className += ' logged-in';
		consoleForm.classList.remove('visible');
		document.querySelector('#entry-body').focus();
  } else {
		body.classList.remove('logged-in');
	}
});

// Submit entries
var submitForm = document.querySelector('.submit');
submitForm.onsubmit = addEntry;

function addEntry(e) {
	e.preventDefault();

	var entry = document.querySelector('#entry-body').value;
	var date = Date.now();

	firebase.database().ref('entries/' + date).set({
		body: entry,
		date: date
	});

	document.querySelector('#entry-body').value = '';
	document.querySelector('#entry-body').focus();
}

// Convert timestamps to readable dates
function convertDate(timestamp) {
	var date = new Date(timestamp);
	var dateMonth = date.getMonth();
	dateMonth = parseInt(dateMonth + 1);
	if(dateMonth < 10) {
		dateMonth = '0' + dateMonth;
	}
	var dateDay = date.getDate();
	var dateYear = date.getFullYear();
	return dateYear + '.' + dateMonth + '.' + dateDay;
}
