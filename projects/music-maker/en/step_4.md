## Change the sound

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
Add interaction so that you can choose what instrument is used when a sound is played.
</div>
<div>
 <video width="320" height="240" controls>
  <source src="images/step-4-demo.mp4" type="video/mp4">
  Your browser does not support mp4 video.
</video>
</div>
</div>

The great thing about digital music is that you can get one instrument sprite to easily play the sounds of many different instruments. 

--- task ---

Add some sprites to represent the different sounds you want your instrument to play. You can use instrument sprites, or choose whatever you like, it does not have to make sense.

![Scratch stage with different instruments displayed, and a bunch of bananas.](images/instruments.png)

--- /task ---

You can add code to the **pick** sprite to change the instrument that is being played when the **pick** sprite touches your additional sprites. 

--- task ---

Add code within a `forever`{:class='block3control'} block, so that when the **pick** touches the different sprites, the instrument being played changes. For example:

```blocks3
when flag clicked
forever
if <touching (Guitar v) ?> then
set instrument to (Electric Guitar v)
end
```
--- /task ---

You can customise your project to play any sound you want when the **pick** touches an instrument, object, or character on the Stage.

--- task ---

**Debug:** You might find some bugs in your project that you need to fix. Here are some common bugs.

--- collapse ---
---
title: The sound changes to the wrong sound
---

Make sure the `if`{:class="block3control"} condition in your `Sensing`{:class='block3control'} block matches the instrument or sound you wanted from the `Music`{:class='block3custom'} extension.

```blocks3
when flag clicked
forever
+ if <touching (Guitar v) ?> then
+ set instrument to (Electric Guitar v)
end
```

--- /collapse ---

--- /task ---
