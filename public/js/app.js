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
    },

    parseCSV: function(csv) {
      var lines = csv.split("\n");
      for (var i=0; i<lines.length; i++){
        var p = lines[i].split(";");
        this.addLecture.apply(this, p);
      }
    }

  });
});

function ModalViewModel() {
  var self = this;

  self.title = ko.observable('');
  self.lecturer = ko.observable('');
  self.date = ko.observable('');
  self.time = ko.observable('');
  self.pdf = ko.observable('');
  self.homework = ko.observable('');

  self.setLecture = function(lecture) {
    $('#b-editModal .modal').modal();
    if (lecture instanceof Lecture)
    {
      self.lecture = lecture;
      self.title(lecture.attr('title'));
      self.lecturer(lecture.attr('lecturer'));
      self.date(lecture.attr('date'));
      self.time(lecture.attr('time'));
      self.pdf(lecture.attr('pdf'));
      self.homework(lecture.attr('homework'));
    }
    else
    {
      self.lecture = new Lecture();
    }
  };

  self.saveLecture = function() {
    self.lecture.attr('title', self.title());
    self.lecture.attr('lecturer', self.lecturer());
    self.lecture.attr('date', self.date());
    self.lecture.attr('time', self.time());
    self.lecture.attr('pdf', self.pdf());
    self.lecture.attr('homework', self.homework());
    self.lecture.save();
    window.location.reload();
  };

}

function LoadViewModel() {
  var self = this;

  self.data = ko.observable('hello');

  self.openDownload = function() {
    $('#b-loadModal .modal').modal();
  };

  self.download = function() {
    Lecture.parseCSV(self.data());
    window.location.reload();
  };

}

function LecturesViewModel(modalVM, loadVM) {
  var self = this;
  var modal = modalVM;
  var load = loadVM;

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
  };

  self.downloadLectures = function() {
    load.openDownload();
  };

  self.addLecture = function(title, lecturer, date, time, pdf, homework) {
    Lecture.addLecture(title, lecturer, date, time, pdf, homework);
    self.updateSearch();
  };

  self.removeLecture = function(lecture) {
    lecture.destroy();
    self.updateSearch();
  };

  self.updateSearch = function() {
    self.searchTerm.valueHasMutated();
  };

  self.parseCSV = function(csv) {
    Lecture.parseCSV(csv);
    self.updateSearch();
  };
}

Lecture.load();
var modalvm = new ModalViewModel();
var loadvm = new LoadViewModel();
var lecturevm = new LecturesViewModel(modalvm, loadvm);

ko.applyBindings(lecturevm, document.getElementById('b-search'));
ko.applyBindings(modalvm, document.getElementById('b-editModal'));
ko.applyBindings(loadvm, document.getElementById('b-loadModal'));

$('.b-admin__print').click(function() {
  window.print();
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
