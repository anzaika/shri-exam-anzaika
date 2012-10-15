var Lecture = Model('lecture', function() {
  this.persistence(Model.localStorage);

  this.extend({

    find_by_lecturer: function(lecturer) {
      return this.select(function() {
        return this.attr("lecturer") == lecturer;
      }).all();
    },

    find_by_regexp: function(regexp) {
      return this.select(function() {
        var patt = new RegExp(regexp, 'i');
        return patt.test(this.attr('title')) ||
               patt.test(this.attr('lecturer'));
      }).all();
    },

    remove_all: function() {
      this.each(function() {
        this.destroy();
      });
    },

    addLecture: function(title, lecturer, date, time, pdf, homework, desc ) {
      var lec = new Lecture({ title: title,
                              lecturer: lecturer,
                              date: date,
                              time: time,
                              pdf: pdf,
                              homework: homework,
                              desc: desc });
      lec.save();
    },

    removeLecture: function(lecture) {
      lecture.destroy();
    }

  });
});

function ModalViewModel() {
  var self = this;

  self.title = ko.observable();
  self.lecturer = ko.observable();
  self.date = ko.observable();
  self.time = ko.observable();
  self.pdf = ko.observable();
  self.homework = ko.observable();
  self.desc = ko.observable();

  self.setLecture = function(lecture) {
    self.title = lecture.attr('title');
    self.lecturer = lecture.attr('lecturer');
    self.date = lecture.attr('date');
    self.time = lecture.attr('time');
    self.pdf = lecture.attr('pdf');
    self.homework = lecture.attr('homework');
    self.desc = 'hello';
  };

}

function LecturesViewModel(modalVM) {
  var self = this;
  var modal = modalVM;

  self.searchTerm = ko.observable('');

  self.lectures = ko.computed(function() {
    Lecture.all();
    if (self.searchTerm === '')
      {
        return Lecture.all();
      }
    else
      {
        return Lecture.find_by_regexp(self.searchTerm());
      }
  });

  self.editLecture = function(lecture) {
    modal.setLecture(lecture);
    $('.modal').modal();
  };

  self.addLecture = function(title, lecturer, date, time, pdf, homework, desc) {
    Lecture.addLecture(title, lecturer, date, time, pdf, homework, desc);
    self.searchTerm.valueHasMutated();
  };

  self.removeLecture = function(lecture) {
    lecture.destroy();
    self.searchTerm.valueHasMutated();
  };
}

Lecture.load();
var mvm = new ModalViewModel();
var lvm = new LecturesViewModel(mvm);

ko.applyBindings(lvm, document.getElementById('b-search'));
ko.applyBindings(mvm, document.getElementById('b-modal'));

$('#b-search a').tooltip();
$('a.b-lecture__remove').hide();
$('a.b-lecture__edit').hide();

$('li.b-lecture').hover(
  function() {
    $(this).children('a.b-lecture__remove').fadeIn();
  },
  function() {
    $(this).children('a.b-lecture__remove').fadeOut();
  }
);

$('li.b-lecture').hover(
  function() {
    $(this).children('a.b-lecture__edit').fadeIn();
  },
  function() {
    $(this).children('a.b-lecture__edit').fadeOut();
  }
);

$('.b-admin__search input').focus();

// new Lecture('Дизайн', 'Михаил Трошев', '1.01.2012'),
// new Lecture('Разработка', 'Сергей Давыдов', '2.01.2012'),
// new Lecture('Тестирование', 'Николай Понкин', '3.01.2012'),
// new Lecture('Деплой', 'Дмитрий Негалустов', '4.01.2012')
