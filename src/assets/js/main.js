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
		var val = this.value;
		var lbl = document.querySelector('[data-for='+this.getAttribute('id')+']');
		lbl.setAttribute('data-value', val);
	});
}

var consoleForm = document.querySelector('.console');
var bash = document.querySelector('#console-bash');
var uname = document.querySelector('#console-uname');
var pass = document.querySelector('#console-pass');

bash.addEventListener('keydown', function(e){
	if(e.keyCode == '13') {
		e.preventDefault();
		var bashVal = bash.value;
		if(bashVal == 'login') {
			consoleForm.className += ' login-uname';
			uname.focus();
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
entries.once('value', function(snapshot){
	// Create an array of entries and sort
	var entries = snapshot.val();
	var entryArr = [];

	for(i in entries) {
		entryArr.push(entries[i]);
	}
	entryArr.sort().reverse();

	for(i in entryArr) {
		var date = entryArr[i].date;
		var body = entryArr[i].body;
		var entryLog = document.querySelector('.log');
		entryLog.innerHTML += '<li><article class="entry"><h2 class="entry_stamp"><time class="hdg" pubdate>☉ '+convertDate(date)+'</time></h2><div class="entry_body body">'+body+'</div></article></li>';
	}

	// Set data-copy attribute (used for text glitching)
	var hdgArr = document.querySelectorAll('.hdg, .entry_body p, .entry_body li');

	for(i = 0; i < hdgArr.length; i++) {
		var glitchCopy = hdgArr[i].innerHTML;
		hdgArr[i].setAttribute('data-copy', glitchCopy)
	}
});

// Sign into Firebase
pass.addEventListener('keydown', function(e){
	if(e.keyCode == '13') {
		var email = uname.value;
		var password = pass.value;

		firebase.auth().signInWithEmailAndPassword(email, password);
	}
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log(user)
  }
});

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
