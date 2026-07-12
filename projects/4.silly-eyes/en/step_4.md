## Sprite effects

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
You can make your **character** sprite and **silly eye** sprites change their `Looks`{:class="block3looks"} when you click on them.
</div>
<div>

![A character and eyes with graphic effects.](images/character-graphic-effects.png){:width="300px"}    

</div>
</div>

### Silly eye effects

--- task ---

Add a `when this sprite clicked`{:class="block3events"} block to your **Eyeball** sprite.

Can you work out what code block you would put underneath to change your sprite's eye colour when you click on the **Eyeball** sprite?

--- collapse ---
---
title: Change graphic effects when the sprite is clicked
---

```blocks3
when this sprite clicked  
change [color v] effect by (25)
```

--- /collapse ---

--- /task ---

--- task ---

If you want both eyeballs to have the same effect, you will need to copy your script to the **Eyeball 2** sprite.

[[[scratch3-copy-code]]]

--- /task ---

### Character effects

--- task ---

Click on your **character** sprite in the Sprite list, then click on the **Code** tab.

Add the same script as you used to change the eye colour. Which graphic effects do you want to change for your **character**?

**Choose:** Choose an effect in the drop-down menu within the `change color effect by`{:class="block3looks"} block. Experiment with the numbers and effects until you have a change that you like.

[[[scratch3-graphic-effects]]]

--- /task ---

### An accessory

Now, add an **accessory**, such as a hat, that changes when you click on it — use the `next costume`{:class="block3looks"} block. 

--- task ---

**Choose:** Add an accessory change or costume change of your choice.

![Sprites with accessories.](images/accessory-sprite.png)

--- collapse ---
---
title: Make a sprite change costume when clicked
---

**Gobo with costume accessories**: [See inside](https://scratch.mit.edu/projects/496334057/editor){:target="_blank"}
<div class="scratch-preview">
<iframe allowtransparency="true" width="485" height="402" src="https://scratch.mit.edu/projects/embed/496334057/?autostart=false" frameborder="0"></iframe>
</div>

Some sprites already have a choice of costumes.

You can add code to make a sprite's costume change to the `next costume`{:class="block3looks"} when you click on the sprite:

```blocks3
when this sprite clicked
next costume
```

--- /collapse ---

If your sprite does not have a choice of costumes, or you want to add more, you can add any costume to a sprite.

[[[scratch3-add-costumes-to-a-sprite]]]

--- /task ---

--- task ---

**Test:** Work on your sprites until they interact in the way that you want. 

**Tip:** Try one change at a time and test what it does so that you can easily spot each change and undo anything that you do not like.  

--- /task ---

--- task ---

**Debug:**

If you add code to the wrong sprite, you can fix that:

[[[scratch3-copy-code]]]

If you need to, you can reset the graphic effects:

--- collapse ---
---
title: I don't want these graphic effects  
---

To reset the graphic effects at any time, click on the `clear graphic effects`{:class="block3looks"} block in the `Looks`{:class="block3looks"} blocks menu. Clicking on the green flag also clears graphic effects.

```blocks3
clear graphic effects
```
--- /collapse ---

--- /task ---

--- task ---

**Test:** Test your project again, but this time, make it full-screen so that you can see how it will appear to someone looking at it.

[[[scratch3-full-screen]]]

--- /task ---

<p style="border-left: solid; border-width:10px; border-color: #0faeb0; background-color: aliceblue; padding: 10px;">
By making your project full-screen, you are seeing what you have made from the perspective of a user who is playing with your project. **User interaction** is important in digital making. 
</p>


