## Set the scene

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
You will set the scene. Choose your backdrop and add a dragonfly that follows the mouse-pointer around the Stage.
</div>
<div>
![Dragonfly in a desert background](images/set-the-scene.png){:width="300px"}
</div>
</div>

--- task ---

Open the [Grow a dragonfly starter project](https://scratch.mit.edu/projects/535695413/editor){:target="_blank"}. Scratch will open a blank project in a new browser tab.

--- /task ---

--- task ---

Click **Choose a Backdrop** and add a backdrop of your choice. We used the **Jurassic** backdrop.

![Backdrop icon on the Scratch app interface](images/choose-backdrop-icon.png)

![The Stage showing the Jurassic backdrop.](images/Jurassic-backdrop.png)

--- /task ---

--- task ---

Click **Choose a Sprite** and search for `dragonfly`, then add the **Dragonfly** sprite.

![Sprite icon on the Scratch app interface](images/choose-sprite-icon.png)

![The search box with 'dragonfly' typed in and the Dragonfly sprite in the gallery.](images/dragonfly-search.png)

--- /task ---

--- task ---

Add a script to make the **Dragonfly** sprite follow the mouse-pointer (or your finger):

![Dragonfly sprite icon on the Scratch app interface](images/dragonfly-icon.png)

```blocks3
when flag clicked
set size to [25] % // to start small
forever
point towards (mouse-pointer v)
move [5] steps
end
```
--- /task ---

--- task ---

**Test:** Click the green flag and make the **Dragonfly** sprite move around the Stage. Is the dragonfly moving as you would expect?

--- /task ---

The Dragonfly costume is not facing to the right, so the head of the **Dragonfly** sprite is not pointing towards the mouse-pointer.

--- task ---

Click on the **Costumes** tab and use the **Select** (arrow) tool to select the costume. 

Use the **Rotate** tool at bottom of the selected costume to turn the **Dragonfly** costume to face the right.

![An animated image showing how to rotate the dragonfly costume by dragging the rotation arrows so that the dragonfly faces right.](images/rotated-costume.gif)

--- /task ---

--- task ---

**Test:** Click the green flag and look at how the dragonfly moves now.

--- /task ---

Dragonfly wings make a fluttering sound as they vibrate. You can edit a sound in Scratch to create your own sound.

--- task ---

Add the **Crank** sound to the **Dragonfly** sprite.

[[[generic-scratch3-sound-from-library]]]

![](images/crank-sound-editor.png)

--- /task ---

--- task ---

**Test:** Click the **Play** button so you can hear the sound.

--- /task --- 

The **Crank** sound is too long and too slow for dragonfly wings.

--- task ---

Select the end of the sound using your cursor or finger.

Click **Copy to New** to make a new sound with just the selected part:

![The end of the crank sound selected in blue with the 'Copy to New' icon highlighted.](images/crank-copy-end.png)

--- /task ---

--- task ---

Rename your new sound from **Crank2** to `Wings`.
![The rename sound property.](images/crank-wings-sound.png) 

--- /task ---

--- task ---

**Test:** Play the new sound. Click the **Faster** button a few times until you like the result:

![A faster sound wave with the 'Faster' icon highlighted.](images/wings-faster.png)

--- /task ---

--- task ---

If you like, you can select the very end of the **Wings** sound, and then click **Delete** to remove it:

![The end of the sound wave selected with the 'Delete' tool highlighted.](images/wings-shorter.png)

--- /task ---

--- task ---

Now add a block to play the **Wings** sound when the dragonfly moves:

![Dragonfly sprite icon](images/dragonfly-icon.png)

```blocks3
when flag clicked
set size to [25] %
forever
+start sound [Wings v]
point towards (mouse-pointer v)
move [5] steps
end
```
--- /task ---

--- task ---

**Test:** Try out your dragonfly movement and sound effect.

--- /task ---

--- save ---
