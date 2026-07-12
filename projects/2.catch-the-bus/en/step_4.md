## The hippo flies to the bus

<div style="display: flex; flex-wrap: wrap">
<div style="flex-basis: 200px; flex-grow: 1; margin-right: 15px;">
Add a hippo sprite that flies to the bus.
</div>
<div>

![The hippo flying to the bus.](images/hippo-flies.png){:width="300px"}

</div>
</div>

### Give the Hippo a starting position

--- task ---

Add the **Hippo1** sprite to your project. 

Change the **Size** of the **Hippo1** sprite:

![The Sprite pane for the Hippo1 sprite, with the size set to 50.](images/hippo-sprite-size.png)

--- /task ---

--- task ---

Drag the hippo to the top left-hand side of the Stage.

![The Hippo1 sprite on the top left-hand side of the Stage.](images/hippo-sprite-stage.png)

--- /task ---

--- task ---

Add code to get the hippo to their starting position:

```blocks3
when flag clicked
go to x: [-200] y: [150] // top left-hand side
```

**Tip:** The `x`{:class="block3motion"} and `y`{:class="block3motion"} coordinates in the `go to x: y:`{:class="block3motion"} block will be the current position of the hippo, so you do not need to type them in.

--- /task ---

### Make the Hippo flap its wings and fly

--- task ---

Add code to make the hippo fly towards the **City Bus**:

```blocks3
when flag clicked
go to x: [-200] y: [150] 
+repeat [100] 
point towards (City Bus v) // change from mouse-pointer
move [3] steps
next costume
+end
```

--- /task ---

--- task ---

**Test:** Click on the green flag and check that the hippo flies to the bus. You can change the number in the `repeat`{:class="block3control"} block to get the hippo to stop in just the right place. 

--- /task ---

### Show and hide the hippo

--- task ---

Add `show`{:class="block3looks"} and `hide`{:class="block3looks"} blocks:

```blocks3
when flag clicked
go to x: [-200] y: [150] 
+ show
repeat [90] 
point towards (City Bus v)
move [3] steps
next costume
end
+ hide
```

--- /task ---

--- task ---

**Test:** Click on the green flag. The hippo will fly and enter the bus.

--- /task ---
