// Generated by CoffeeScript 1.10.0
(function() {
  var adjustModal;

  window.sl = {
    get_options: function(el, args) {
      if (args[0] != null) {
        return args[0];
      } else {
        return $(el).data();
      }
    },
    show_overlay: function() {
      if ($(".overlay").size() === 0) {
        $("body").append('<div class="overlay"></div>');
        $(".overlay").click(function() {
          $(".modal").fadeOut();
          return sl.hide_overlay();
        });
      }
      return $(".overlay").fadeIn();
    },
    hide_overlay: function() {
      if ($(".overlay").size()) {
        return $(".overlay").fadeOut();
      }
    },
    toggle_overlay: function() {
      if ($(".overlay").is(":visible")) {
        return sl.hide_overlay();
      } else {
        return sl.show_overlay();
      }
    }
  };

  $.fn.dropdown = function() {
    var els;
    els = this;
    $(els).each(function() {
      var el, event;
      el = this;
      event = window.ontouchstart !== void 0 ? 'click' : 'mouseenter mouseleave';
      return $(el).on(event, function(e) {
        e.preventDefault();
        return $(el).find(">ul").stop().slideToggle();
      });
    });
    return this;
  };

  adjustModal = function(target) {
    if ($(target).outerHeight() > ($(window).height() - $(target).css("padding-top").replace("px", "") * 4)) {
      $(target).height($(window).height() - $(target).css("padding-top").replace("px", "") * 4);
    }
    $(target).css("top", ($(window).height() - $(target).outerHeight()) * 0.5);
    return $(target).css("left", ($(window).width() - $(target).outerWidth()) * 0.5);
  };

  $.fn.modal = function() {
    sl.toggle_overlay();
    adjustModal(this);
    return this;
  };

  $(document).ready(function() {
    return $(window).resize(function() {
      return $(".modal").each(function() {
        return adjustModal(this);
      });
    });
  });

  console.log("paralax here");

  $.fn.toggler = function() {
    var el, options, target;
    options = sl.get_options(this, arguments);
    el = $(this);
    target = options.target != null ? $(options.target) : $(el.attr("href"));
    el.click(function(e) {
      $(target).toggleClass("toggle-target-opened");
      e.preventDefault();
      switch (options.toggle) {
        case "slide":
          return target.stop().slideToggle(options.options);
        case "fade":
          return target.stop().fadeToggle(options.options);
        case "modal":
          return $(target).modal(options).stop().fadeToggle(options.options);
        default:
          return target.stop().toggle(options.options);
      }
    });
    return this;
  };

  $(document).ready(function() {
    $('[data-toggle]').each(function() {
      return $(this).toggler();
    });
    $('.modal').each(function() {
      var modal;
      modal = $(this);
      return modal.find(".close-modal").each(function() {
        return $(this).click(function() {
          return modal.modal().hide();
        });
      });
    });
    return $("body").click(function(e) {
      if (!e.target.hasAttribute("data-toggle")) {
        return $('.toggle-target-opened:not(.modal)').hide();
      }
    });
  });

}).call(this);