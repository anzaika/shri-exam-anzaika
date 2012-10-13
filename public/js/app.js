var Lecture = Model('lecture', function() {
  this.persistence(Model.localStorage);
  this.extend({
    find_by_lecturer: function(lecturer) {
      return this.detect(function() {
        return this.attr("title") == title;
      });
    },
    remove_all: function() {
      this.each(function() {
        this.destroy();
      });
    }
  });
});

function LecturesViewModel() {
  var self = this;

  self.lectures = ko.observableArray();
  self.searchTerm = ko.observable('');

  self.addNewLecture = function(title, date, lecturer) {
    var lec = new Lecture({title: title, date: date, lecturer: lecturer});
    lec.save();
    self.lectures.push(lec);
  };

  self.addLecture = function(lecture) {
    self.lectures.push(lecture);
  };

  self.removeLecture = function(lecture) {
    self.lectures.remove(lecture);
    lecture.destroy();
  };

}

var vm = new LecturesViewModel();

Lecture.load();
Lecture.each(function(){
  vm.addLecture(this);
});

ko.applyBindings(vm);

$('a.b-lecture__remove').css('opacity', 0);
$('a.b-lecture__edit').css('opacity', 0);

$('.b-lecture').hover(
  function() {
    $(this).children('a.b-lecture__remove').fadeTo('slow', 1);
  },
  function() {
    $(this).children('a.b-lecture__remove').fadeTo('opacity', 0);
  }
);

$('.b-lecture').hover(
  function() {
    $(this).children('a.b-lecture__edit').fadeTo('slow', 1);
  },
  function() {
    $(this).children('a.b-lecture__edit').fadeTo('opacity', 0);
  }
);


// new Lecture('Дизайн', '1.01.2012', 'Михаил Трошев'),
// new Lecture('Разработка', '2.01.2012', 'Сергей Давыдов'),
// new Lecture('Тестирование', '3.01.2012', 'Николай Понкин'),
// new Lecture('Деплой', '4.01.2012', 'Дмитрий Негалустов')
