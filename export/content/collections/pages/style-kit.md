---
id: b1c59cf8-bb49-40a0-9fa9-2bbfd5d9c8be
blueprint: style_kit
title: 'Style Kit'
seo_noindex: true
seo_nofollow: true
seo_canonical_type: entry
sitemap_change_frequency: weekly
sitemap_priority: 0.5
updated_by: b1493ffc-652b-408c-a2e0-3224ba2b1f3c
updated_at: 1744079317
page_builder:
  -
    id: m96knwgm
    columns:
      -
        id: m96knxpe
        column_content:
          -
            type: paragraph
            attrs:
              textAlign: left
            content:
              -
                type: text
                text: 'This is the columns block. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. '
          -
            type: heading
            attrs:
              textAlign: left
              level: 3
            content:
              -
                type: text
                text: 'Heading h3'
          -
            type: paragraph
            attrs:
              textAlign: left
            content:
              -
                type: text
                text: 'Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. '
          -
            type: set
            attrs:
              id: m97v6388
              values:
                type: buttons
                buttons:
                  -
                    id: m97v644o
                    label: 'Primary Button'
                    link_type: url
                    target_blank: false
                    url: '#'
                    button_type: button
                  -
                    id: m97v6h0j
                    label: 'Primary button (external)'
                    link_type: url
                    target_blank: true
                    url: '#'
                    button_type: button
                  -
                    id: m97v6xnn
                    label: 'Inline button'
                    link_type: url
                    target_blank: false
                    url: '#'
                    button_type: inline
                  -
                    id: m97v8ius
                    label: 'Inline button (external)'
                    link_type: url
                    target_blank: true
                    url: '#'
                    button_type: inline
          -
            type: paragraph
            attrs:
              textAlign: left
          -
            type: paragraph
            attrs:
              textAlign: left
            content:
              -
                type: text
                marks:
                  -
                    type: bold
                text: 'Here are our contact details:'
          -
            type: set
            attrs:
              id: m97la4tm
              values:
                type: contact_details
                display_contacts:
                  - phone
                  - mobile
                  - email
                  - address
        type: column
        enabled: true
        mobile_order: auto
      -
        id: m96koho8
        type: column
        enabled: true
        column_content:
          -
            type: set
            attrs:
              id: m97l9zck
              values:
                type: image
                image: placeholder-wepb-image.webp
                size: md
                caption: 'This is the image caption'
        mobile_order: order-first
    type: columns
    enabled: true
    layout_two_col: even
    align_content: items-start
    heading: 'Columns Block'
    layout: false
    heading_alignment: items-start
  -
    id: m96komkd
    type: divider
    enabled: true
  -
    id: m96z79j8
    article:
      -
        type: paragraph
        attrs:
          textAlign: left
        content:
          -
            type: text
            text: 'This is an article block. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.'
      -
        type: set
        attrs:
          id: m96z7iuh
          values:
            type: image
            size: 2xl
            caption: 'Breakout image with caption'
            image: placeholder-wepb-image.webp
      -
        type: set
        attrs:
          id: m97027lm
          values:
            type: table
            size: xl
            first_row_headers: true
            first_column_headers: false
            table:
              -
                cells:
                  - Header
                  - 'header column 2'
                  - 'col 3'
              -
                cells:
                  - content
                  - content
                  - 'and some content in here......'
            caption: 'table caption, smaller breakout'
    type: article
    enabled: true
  -
    id: m97kdqnk
    type: divider
    enabled: true
  -
    id: m97nisui
    title: 'Contact form'
    text: 'Form desctiption'
    form: contact
    type: form
    enabled: true
hero_type: simple
custom_page_title: true
page_lede:
  -
    type: paragraph
    content:
      -
        type: text
        text: 'This page outlines the current colours, styles and design standards for this website'
page_heading: 'Website Style Kit'
colours:
  -
    id: m97t46ab
    group_heading: 'Brand Colours'
    colour_swatches:
      -
        id: m97t4bhb
        name: Primary
        css_variable: bg-primary
        css_class: bg-primary
      -
        id: m97t4sb7
        name: Secondary
        css_variable: bg-secondary
        css_class: bg-secondary
    type: colour_group
    enabled: true
  -
    id: m97taite
    group_heading: 'Auxiliary Colours'
    colour_swatches:
      -
        id: m97tatd4
        name: 'Neutral 100'
        css_variable: bg-neutral-100
        css_class: bg-neutral-100
      -
        id: m97tbep1
        name: 'Neutral 200'
        css_variable: bg-neutral-200
        css_class: bg-neutral-200
    type: colour_group
    enabled: true
---
