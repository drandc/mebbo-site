/* Practice questions on the /medborgarskapsprovet/ pages.
   Without JavaScript each question is a plain list with the answer in a
   <details> element. With JavaScript the options become buttons that show
   right or wrong and the explanation, like the quiz on the home page.
   Nothing is stored: answers live in the page's memory only. */
(function () {
  var lists = document.querySelectorAll('.quiz-list');
  Array.prototype.forEach.call(lists, function (list) {
    var cards = list.querySelectorAll('.quiz-card');
    var score = document.getElementById(list.getAttribute('data-score'));
    var answered = 0, right = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var correct = parseInt(card.getAttribute('data-correct'), 10);
      var details = card.querySelector('.quiz-answer');
      var explanationText = card.querySelector('.quiz-why').textContent;
      var correctText = card.querySelector('.quiz-correct').textContent;
      var items = card.querySelectorAll('.quiz-options li');
      var buttons = [];

      Array.prototype.forEach.call(items, function (li, i) {
        var old = li.querySelector('.quiz-option');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        while (old.firstChild) btn.appendChild(old.firstChild);
        li.replaceChild(btn, old);
        buttons.push(btn);
        btn.addEventListener('click', function () { choose(i); });
      });

      var box = document.createElement('div');
      box.className = 'quiz-explanation';
      box.setAttribute('role', 'status');
      box.hidden = true;
      details.parentNode.insertBefore(box, details);
      details.hidden = true;

      function choose(i) {
        var ok = i === correct;
        buttons.forEach(function (b, idx) {
          b.disabled = true;
          if (idx === correct) b.classList.add('correct');
          else if (idx === i) b.classList.add('incorrect');
          else b.classList.add('dimmed');
        });
        box.textContent = '';
        var verdict = document.createElement('div');
        verdict.className = 'quiz-verdict';
        verdict.textContent = ok ? 'Rätt svar' : 'Inte riktigt';
        box.appendChild(verdict);
        if (!ok) {
          var p0 = document.createElement('p');
          p0.textContent = 'Rätt svar är ' + correctText + '.';
          box.appendChild(p0);
        }
        var p = document.createElement('p');
        p.textContent = explanationText;
        box.appendChild(p);
        box.classList.toggle('wrong', !ok);
        box.hidden = false;

        answered++;
        if (ok) right++;
        if (score && answered === cards.length) {
          score.textContent = 'Du svarade rätt på ' + right + ' av ' + cards.length + ' frågor.';
          score.hidden = false;
        }
      }
    });
  });
})();
