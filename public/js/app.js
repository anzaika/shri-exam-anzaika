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
               patt.test(this.attr('lecturer')) ||
               patt.test(this.attr('date'));
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

  self.lecture = '';
  self.title = ko.observable();
  self.lecturer = ko.observable();
  self.date = ko.observable();
  self.time = ko.observable();
  self.pdf = ko.observable();
  self.homework = ko.observable();
  self.desc = ko.observable();

  self.setLecture = function(lecture) {
    self.lecture = lecture;
    self.title(lecture.attr('title'));
    self.lecturer(lecture.attr('lecturer'));
    self.date(lecture.attr('date'));
    self.time(lecture.attr('time'));
    self.pdf(lecture.attr('pdf'));
    self.homework(lecture.attr('homework'));
    self.desc(lecture.attr('desc'));
  };

  self.saveLecture = function() {
    self.lecture.attr('title', self.title());
    self.lecture.attr('lecturer', self.lecturer());
    self.lecture.attr('date', self.date());
    self.lecture.attr('time', self.time());
    self.lecture.attr('pdf', self.pdf());
    self.lecture.attr('homework', self.homework());
    self.lecture.attr('desc', self.desc());
    self.lecture.save();
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
    self.updateSearch();
  };

  self.removeLecture = function(lecture) {
    lecture.destroy();
    self.updateSearch();
  };

  self.updateSearch = function() {
    self.searchTerm.valueHasMutated();
  };
}

Lecture.load();
var mvm = new ModalViewModel();
var lvm = new LecturesViewModel(mvm);

ko.applyBindings(lvm, document.getElementById('b-search'));
ko.applyBindings(mvm, document.getElementById('b-modal'));

$('li.b-admin__addLecture').click(function() {
  lvm.editLecture( new Lecture());
});

$('#b-modal button').click(function() {
  mvm.saveLecture();
  window.location.reload();
  $('.modal').modal('toggle');
});

// $('li.b-lecture').hover(
//   function() {
//     $(this).children('a.b-lecture__remove').fadeIn();
//   },
//   function() {
//     $(this).children('a.b-lecture__remove').fadeOut();
//   }
// );

// $('li.b-lecture').hover(
//   function() {
//     $(this).children('a.b-lecture__edit').fadeIn();
//   },
//   function() {
//     $(this).children('a.b-lecture__edit').fadeOut();
//   }
// );

$('.b-admin__search input').focus();
