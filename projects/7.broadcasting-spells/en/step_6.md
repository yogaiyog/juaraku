## Add another character

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
Get a sprite of your choice to respond to the spells. You will need to create a toad costume 'mash-up' for the sprite, and add code so the costume changes when the spell messages are broadcast.
</div>
<div>
![The Stage showing a second toad transformation.](images/another-character.png){:width="300px"}
</div>
</div>

--- task ---

Duplicate the **Fairy** sprite. 

![](images/duplicate-fairy.png)

--- /task ---

--- task ---

Delete the **Fairy-a** and **Fairy-toad-a** costumes. You will be left with a **toad** costume.

--- /task ---

--- task ---

Add a costume of your choice to the **new sprite**. 

We chose the **Batter**:

![](images/batter-on-stage.png)

You might want to change the direction the sprite is pointing in. 

**Tip:** If your sprite goes upside down you can change its `rotation-style`{:class="block3motion"} to `left-right`{:class="block3motion"} in the Sprite properties pane or using a code block.

--- /task ---

When you grow or shrink a sprite, you want the feet to stay in the same place.

--- task ---

First use the **Select** (arrow) tool to draw a rectangle around the costume and then **Group** it. Then drag your character above the crosshair.

![](images/character2-crosshair.png)

--- /task ---

--- task ---

Click on the **toad** costume.

Rename the costume to match your sprite, we used **Batter-toad-a**.

![](images/batter-toad-a-added.png)

--- /task ---

--- task ---

If the toad costume is facing the opposite way to the main costume you can use **Flip Horizontal**.

![](images/flip-horizontal.png)

--- /task ---

Now you need to make the toad look like the character. Combining two costumes in this way is called a 'mash-up'.

--- task ---

You can use the Paint editor to add a small detail, like a splash of colour, or a hat!

**Tip:** You can add any costume to your character sprite. Use the **Select** (arrow) tool then click on **Copy** or **Paste**.

![](images/editing-options.png)

**Tip:** You can group all the objects in a costume. Select them (with the **Select** tool or <kbd>
Ctrl-a</kbd>) and then click **Group**.

Our Batter toad looks like:
![](images/batter-toad.png)

--- /task ---

--- task ---

Switch to the **Code** tab for your new sprite.

Change all of the `switch costume`{:class="block3looks"} blocks to use the correct costumes for your new sprite.

You might also want to change the start `size`{:class="block3looks"} of the sprite `when green flag clicked`{:class="block3events"}.

--- /task ---

--- task ---

**Test:** Click on the spell buttons — both characters should respond to the spell broadcasts.

**Debug:** Check that you have changed the costumes in the `switch costume`{:class="block3looks"} blocks for your new sprite.

--- /task ---

--- save ---
