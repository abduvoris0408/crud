import React, { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'

const App = () => {
	const [items, setItems] = useState(() => {
		const savedItems = localStorage.getItem('crudItems')
		return savedItems ? JSON.parse(savedItems) : []
	})
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [currentItem, setCurrentItem] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [itemToDelete, setItemToDelete] = useState(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [formData, setFormData] = useState({ name: '', email: '', role: '' })
	const [formErrors, setFormErrors] = useState({})
	const itemsPerPage = 5

	useEffect(() => {
		localStorage.setItem('crudItems', JSON.stringify(items))
	}, [items])

	const validateForm = () => {
		const errors = {}
		if (!formData.name.trim()) errors.name = 'Name is required'
		if (!formData.email.trim()) {
			errors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = 'Email is invalid'
		}
		if (!formData.role.trim()) errors.role = 'Role is required'
		setFormErrors(errors)
		return Object.keys(errors).length === 0
	}

	const handleSubmit = e => {
		e.preventDefault()
		if (!validateForm()) return

		if (currentItem) {
			setItems(
				items.map(item =>
					item.id === currentItem.id
						? { ...formData, id: currentItem.id }
						: item
				)
			)
		} else {
			setItems([...items, { ...formData, id: Date.now() }])
		}

		setIsModalOpen(false)
		setCurrentItem(null)
		setFormData({ name: '', email: '', role: '' })
	}

	const handleEdit = item => {
		setCurrentItem(item)
		setFormData(item)
		setIsModalOpen(true)
	}

	const handleDelete = item => {
		setItemToDelete(item)
		setShowDeleteModal(true)
	}

	const confirmDelete = () => {
		setItems(items.filter(item => item.id !== itemToDelete.id))
		setShowDeleteModal(false)
		setItemToDelete(null)
	}

	const filteredItems = items.filter(item =>
		Object.values(item).some(value =>
			value.toString().toLowerCase().includes(searchQuery.toLowerCase())
		)
	)

	const pageCount = Math.ceil(filteredItems.length / itemsPerPage)
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	)

	return (
		<div className='container mx-auto p-8 bg-gray-50'>
			<div className='flex justify-between p-10 items-center mb-6'>
				<h1 className='text-3xl font-bold text-gray-800'>Users</h1>
				<button
					onClick={() => {
						setCurrentItem(null)
						setFormData({ name: '', email: '', role: '' })
						setIsModalOpen(true)
					}}
					className='bg-blue-500 text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600'
				>
					<FiPlus /> Add New User
				</button>
			</div>

			<div className='relative mb-6'>
				<FiSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500' />
				<input
					type='text'
					placeholder='Search users...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className='w-full py-2 pl-12 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>

			<div className='overflow-x-auto bg-white rounded-lg shadow-lg'>
				<table className='min-w-full table-auto'>
					<thead>
						<tr className='bg-gray-100'>
							<th className='py-2 px-4 text-left'>Name</th>
							<th className='py-2 px-4 text-left'>Email</th>
							<th className='py-2 px-4 text-left'>Role</th>
							<th className='py-2 px-4 text-left'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{paginatedItems.length > 0 ? (
							paginatedItems.map(item => (
								<tr key={item.id} className='border-b'>
									<td className='py-2 px-4'>{item.name}</td>
									<td className='py-2 px-4'>{item.email}</td>
									<td className='py-2 px-4'>{item.role}</td>
									<td className='py-2 px-4 flex items-center gap-2'>
										<button
											onClick={() => handleEdit(item)}
											className='text-blue-500 hover:text-blue-700 flex items-center gap-1 rounded-md border p-1'
										>
											<FiEdit2 />
											<p>Edit</p>
										</button>
										<button
											onClick={() => handleDelete(item)}
											className='text-red-500 hover:text-red-700 ml-4 flex items-center gap-1 rounded-md border p-1'
										>
											<FiTrash2 /> <p>Delete</p>
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan='4'
									className='py-4 text-center text-gray-500'
								>
									No data found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{pageCount > 1 && (
				<div className='flex justify-center mt-6'>
					{[...Array(pageCount)].map((_, index) => (
						<button
							key={index}
							onClick={() => setCurrentPage(index + 1)}
							className={`px-4 py-2 rounded-md mx-1 border border-gray-300 ${
								currentPage === index + 1
									? 'bg-blue-500 text-white'
									: 'bg-white text-gray-700 hover:bg-gray-100'
							}`}
						>
							{index + 1}
						</button>
					))}
				</div>
			)}

			{isModalOpen && (
				<div className='fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50'>
					<div className='bg-white p-6 rounded-lg shadow-lg w-96'>
						<h2 className='text-2xl font-semibold mb-4'>
							{currentItem ? 'Edit User' : 'Add New User'}
						</h2>
						<form onSubmit={handleSubmit}>
							<div className='mb-4'>
								<label className='block text-gray-700'>
									Name
								</label>
								<input
									type='text'
									placeholder='Name'
									value={formData.name}
									onChange={e =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
									className='w-full py-2 px-4 border border-gray-300 rounded-md'
								/>
							</div>
							<div className='mb-4'>
								<label className='block text-gray-700'>
									Email
								</label>
								<input
									type='email'
									placeholder='Email'
									value={formData.email}
									onChange={e =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									className='w-full py-2 px-4 border border-gray-300 rounded-md'
								/>
							</div>
							<div className='mb-4'>
								<label className='block text-gray-700'>
									Role
								</label>
								<input
									type='text'
									placeholder='Role'
									value={formData.role}
									onChange={e =>
										setFormData({
											...formData,
											role: e.target.value,
										})
									}
									className='w-full py-2 px-4 border border-gray-300 rounded-md'
								/>
							</div>
							<div className='flex justify-between'>
								<button
									type='submit'
									className='bg-blue-500 text-white px-6 py-2 rounded-md'
								>
									{currentItem ? 'Update' : 'Create'}
								</button>
								<button
									type='button'
									onClick={() => setIsModalOpen(false)}
									className='bg-gray-500 text-white px-6 py-2 rounded-md'
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{showDeleteModal && (
				<div className='fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50'>
					<div className='bg-white p-6 rounded-lg shadow-lg w-96'>
						<h2 className='text-2xl font-semibold mb-4'>
							Confirm Delete
						</h2>
						<p className='mb-4'>
							Are you sure you want to delete this user?
						</p>
						<div className='flex justify-between'>
							<button
								onClick={() => setShowDeleteModal(false)}
								className='bg-gray-500 text-white px-6 py-2 rounded-md'
							>
								Cancel
							</button>
							<button
								onClick={confirmDelete}
								className='bg-red-500 text-white px-6 py-2 rounded-md'
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
