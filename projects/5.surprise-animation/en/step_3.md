## Show curiosity 

Will the object do something to attract attention? How will the character react? You decide! Create the **second part** of your animation. 

![A film strip with 3 frames. The second frame is highlighted. The frame shows a scene with character thinking 'hmmmm' while looking at a curious object.](images/curiosity.png)

<p style="border-left: solid; border-width:10px; border-color: #0faeb0; background-color: aliceblue; padding: 10px;">
  <span style="color: #0faeb0">**Decomposition**</span> is breaking a project down into parts that are smaller and easier to understand. This means that you can build a project one part at a time until you have completed it. In this step you will focus only on the curiosity part of your animation.
</p>

### The object

--- task ---

**Choose:** If you want the 🎂🎾🎁 **interesting object** to do something to attract attention, choose what the object will do.

![A desert background with a rock jiggling back and forth.](images/jiggle.gif)

Add blocks to the end of the 🎂🎾🎁 **interesting object's** `when green flag clicked`{:class="block3events"} setup script.

[[[scratch3-jiggle-a-sprite]]]

[[[scratch3-graphic-effects]]]

--- /task ---

### The character

--- task ---

Get the 🐙👩‍🦼🦖 **main character** to show interest in the object. Add blocks to the end of the 🐙👩‍🦼🦖 **main character's** setup script. 

If you need the 🐙👩‍🦼🦖 **main character** to wait until the 🎂🎾🎁 **interesting object** has done something, add a `wait`{:class="block3control"} block.

![A desert background with a rock jiggling back and forth.](images/bear.gif)

You could use `say`{:class="block3looks"} or `think`{:class="block3looks"} blocks, or even use the `Text to Speech`{:class="block3extensions"} extension to make the character talk out loud!

[[[scratch3-text-to-speech]]]

The character could emote, like in the [Space talk](https://projects.raspberrypi.org/en/projects/space-talk){:target="_blank"} project. 

[[[scratch3-change-costumes-to-show-mood]]]

The character could be brave and move closer to check out the object.

[[[scratch3-animate-movement-costumes]]]

--- /task ---

--- task ---

**Test:** Click on the green flag to test your project. The 🐙👩‍🦼🦖 **main character** should show curiosity about the object. 

Click on the green flag again. If you changed the 🎂🎾🎁 **interesting object** or 🐙👩‍🦼🦖 **main character** sprite's position or looks, you will need to make sure that they are set back to their starting position or looks when you run the project again.

--- collapse ---
---
title: Set the starting position and looks for a sprite
---

Choose the blocks that you need to set the position and looks for a sprite at the start.

```blocks3
when flag clicked // add blocks to set up the start 
switch costume to [costume1 v]
set size to (100) % // starting size
go to x: (-200) y: (50) // starting position
point in direction [90]
set [brightness v] effect to [80]
show
```

**Tip:** All graphic effects are cleared when you click on the green flag, so you don't need to clear them, but you might need to set the effects that you want the sprite to have. 

--- /collapse ---

--- /task ---

--- task ---

**Debug:**

--- collapse ---
---
title: The sound is not working
---

Check that the volume on your computer or tablet is loud enough and that your speakers or headphones are connected and working properly. 

--- /collapse ---

--- collapse ---
---
title: My animation does not reset properly when I click on the green flag
---

Check that your project has `when green flag clicked`{:class="block3events"} scripts for the sprites that need them, and check that they reset the position, size, and looks for the sprites. For help with this, see the **Set the starting position and looks for a sprite** task above.

--- /collapse ---

--- /task ---

