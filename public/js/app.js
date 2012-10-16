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
                              homework: homework });
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

  this.include({
    validate: function() {
      if (this.attr('title') === "")
        {
          this.errors.add("title", "can't be empty");
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

  self.data = ko.observable();

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

if (Lecture.all().length === 0)
{
  Lecture.parseCSV(
    "Общий цикл разработки;Михаил Трошев;15.09.2012;12:00;http://yadi.sk/d/VDsJ4ZUBiq6u\n"+
    "Task Tracker;Сергей Бережной;15.09.2012;13:00;http://yadi.sk/d/D5xTwoIciq6c\n"+
    "Wiki;Сергей Бережной;15.09.2012;14:00;http://yadi.sk/d/7F9PuECdiq6G\n"+
    "Командная строка Unix;Виктор Ашик;18.09.2012;19:00;http://yadi.sk/d/3N0d6h9rlRA8;https://github.com/yandex-shri/dz-unix-cli\n"+
    "Редакторы кода;Вячеслав Олиянчук;18.09.2012;20:00;https://github.com/yandex-shri/lectures/blob/master/05-editors.md\n"+
    "Браузеры;Георгий Мостоловица;20.09.2012;19:00;http://yadi.sk/d/-VjNYqjTqTca\n"+
    "Системы контроля версий;Сергей Сергеев;20.09.2012;20:00;http://yadi.sk/d/a7aY8YXjr-hs\n"+
    "Тестирование;Марина Широчкина;22.09.2012;12:00;http://yadi.sk/d/W7lDOetHqTWC\n"+
    "Деплой;Павел Пушкарёв;22.09.2012;13:00;http://yadi.sk/d/N4FYrhS3qTSI\n"+
    "HTTP протокол;Алексей Бережной;22.09.2012;14:00;http://yadi.sk/d/waP8x8maqTKM\n"+
    "XSLT;Сергей Пузанков;24.09.2012;18:00;http://yadi.sk/d/PLpXM88frhSW;https://github.com/yandex-shri/dz-xslt\n"+
    "Механизм работы браузера;Роман Комаров;25.09.2012;19:00;http://yadi.sk/d/wo1LfOGatbOM\n"+
    "Кеширование на клиенте и сервере;Егор Львовский;25.09.2012;20:200;http://yadi.sk/d/EEEp53YstbNo\n"+
    "Безопасность веб-приложений;Тарас Иващенко;27.09.2012;12:00;http://yadi.sk/d/bo1OpD2Av3vC\n"+
    "Языки программирования;Алексей Воинов;28.09.2012;19:00;http://yadi.sk/d/LRpqvLuIv4UI;https://github.com/yandex-shri/dz-programming-languages\n"+
    "JS базовые знания;Михаил Давыдов;29.09.2012;12:00;http://yadi.sk/d/uNQ-MR23w54y;https://github.com/yandex-shri/dz-js-basics\n"+
    "Транспорт. AJAX;Михаил Давыдов;29.09.2012;13:00;http://yadi.sk/d/QpvJjsHdw5Oq;https://github.com/yandex-shri/dz-js-ajax\n"+
    "JS. Асинхронность;Михаил Давыдов;29.09.2012;14:00;http://yadi.sk/d/7_0EkGHpw6pY;https://github.com/yandex-shri/dz-js-async\n"+
    "Отладка кода;Алексей Андросов;2.10.2012;19:00;http://yadi.sk/d/5fTEBWfu01pFQ\n"+
    "CSS;Михаил Трошев;2.10.2012;20:00;http://yadi.sk/d/1XZK0I1a05xaK\n"+
    "Клиентская оптимизация;Иван Карев;4.10.2012;19:00;http://yadi.sk/d/S3dVJJdL01pTk;https://github.com/yandex-shri/dz-performance\n"+
    "Профилирование;Михаил Корепанов;4.10.2012;20:00;http://yadi.sk/d/1EjnM84h01plG\n"+
    "Регулярные выражения;Максим Ширшин;6.10.2012;12:00;http://yadi.sk/d/cPE_GA-w06Iag\n"+
    "Фреймворки. Обзор;Алексей Андросов;9.10.2012;19:00;http://yadi.sk/d/92XeomWV06mg2\n"+
    "jQuery;Алексей Бережной;9.10.2012;20:00;http://yadi.sk/d/4zPgYu1V06nAc\n"+
    "БЭМ теория;Владимир Варанкин;11.10.2012;19:00;http://yadi.sk/d/105T-6Yh09LBT\n"+
    "БЭМ практика;Владимир Варанкин;11.10.2012;20:00;http://yadi.sk/d/ykzBLsJB09MOn\n"+
    "Шаблонизаторы;Сергей Бережной;13.10.2012;12:00;http://yadi.sk/d/tJ-_u1NH0C_5d\n"+
    "Дизайн;Константин Горский;13.10.2012;13:00;http://yadi.sk/d/OdcBA5SD0C_7x\n"+
    "Дизайн глазами разработчика;Михаил Трошев;13.10.2012;14:00;http://yadi.sk/d/00Q3C7W50C_9B"
  );
  lecturevm.updateSearch();
}

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
